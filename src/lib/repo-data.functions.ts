import { RuntimeControls } from "../../schemas/runtime";
import { createServerFn } from "@tanstack/react-start";
import { parse, stringify } from "yaml";
import { z } from "zod";
import { setDryRunInText } from "./yaml-edit";
import { ApplicationsLog, DailyRun, Insight, FormAnswers, Targets, Guardrails } from "../../schemas/index";

// Bundled snapshot of the repo files — used when the real filesystem is unavailable
// (hosted preview). Locally, `npm run dev` reads the live files on every request.
const bundledAppsGlob = import.meta.glob("../../demo/applications-log.json", { eager: true, import: "default" });
const bundledApps = Object.values(bundledAppsGlob)[0] ?? [];
const bundledRuns = import.meta.glob("../../demo/runs/*.json", { eager: true, import: "default" });
const bundledInsights = import.meta.glob("../../demo/insights/*.json", { eager: true, import: "default" });
const bundledText = import.meta.glob(
  ["../../demo/targets.yaml", "../../demo/form-answers.yaml", "../../demo/guardrails.yaml"],
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const EDITABLE = {
  targets: "context/targets.yaml",
  formAnswers: "context/form-answers.yaml",
  guardrails: "config/guardrails.yaml",
} as const;
type EditableKey = keyof typeof EDITABLE;

async function fsApi() {
  if (!import.meta.env.DEV) return null;
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = process.cwd();
    await fs.access(path.join(root, "config/guardrails.yaml"));
    return { fs, path, root };
  } catch {
    return null;
  }
}

async function readJsonDir(dir: string, fallback: Record<string, unknown>) {
  const api = await fsApi();
  if (!api) return Object.values(fallback);
  const full = api.path.join(api.root, dir);
  const files = (await api.fs.readdir(full).catch(() => [])).filter((f) => f.endsWith(".json"));
  return Promise.all(files.map(async (f) => JSON.parse(await api.fs.readFile(api.path.join(full, f), "utf8"))));
}

export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const api = await fsApi();
  const rawApps = api
    ? JSON.parse(await api.fs.readFile(api.path.join(api.root, "logs/applications-log.json"), "utf8").catch(() => "[]"))
    : bundledApps;
  const apps = ApplicationsLog.safeParse(rawApps);
  const runs = (await readJsonDir("logs/runs", bundledRuns))
    .map((r) => DailyRun.safeParse(r))
    .filter((r) => r.success)
    .flatMap((r) => r.success ? [r.data] : [])
    .sort((a, b) => b.run_id.localeCompare(a.run_id));
  const insights = (await readJsonDir("logs/insights", bundledInsights))
    .map((r) => Insight.safeParse(r))
    .filter((r) => r.success)
    .flatMap((r) => r.success ? [r.data] : []);
  return {
    live: !!api,
    applications: apps.success ? apps.data : [],
    invalidLog: apps.success ? null : apps.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`),
    runs,
    insights,
  };
});

async function readText(key: EditableKey) {
  const api = await fsApi();
  if (api) return api.fs.readFile(api.path.join(api.root, EDITABLE[key]), "utf8").catch(() => bundledText[`../../demo/${EDITABLE[key].split("/").at(-1)}`] ?? "");
  return bundledText[`../../demo/${EDITABLE[key].split("/").at(-1)}`] ?? "";
}

export const getConfigFiles = createServerFn({ method: "GET" }).handler(async () => {
  const api = await fsApi();
  const [targets, formAnswers, guardrails] = await Promise.all([
    readText("targets"),
    readText("formAnswers"),
    readText("guardrails"),
  ]);
  return { live: !!api, targets, formAnswers, guardrails, dryRun: !!parse(guardrails)?.dry_run };
});

export const saveConfigFile = createServerFn({ method: "POST" })
  .inputValidator(z.object({ key: z.enum(["targets", "formAnswers"]), content: z.string().max(200_000) }))
  .handler(async ({ data }) => {
    (data.key === "targets" ? Targets : FormAnswers).parse(parse(data.content));
    const api = await fsApi();
    if (!api) throw new Error("Read-only: run the dashboard locally with npm run dev to save files.");
    await api.fs.writeFile(api.path.join(api.root, EDITABLE[data.key]), data.content, "utf8");
    return { ok: true };
  });

export const setDryRun = createServerFn({ method: "POST" })
  .inputValidator(z.object({ dryRun: z.boolean() }))
  .handler(async ({ data }) => {
    const api = await fsApi();
    if (!api) throw new Error("Read-only: run the dashboard locally with npm run dev to save files.");
    const file = api.path.join(api.root, EDITABLE.guardrails);
    Guardrails.parse(parse(await api.fs.readFile(file, "utf8")));
    if (!data.dryRun && !FormAnswers.safeParse(parse(await readText("formAnswers"))).success) {
      throw new Error("Verify your personal answers and resume before turning dry run off.");
    }
    await api.fs.writeFile(file, setDryRunInText(await api.fs.readFile(file, "utf8"), data.dryRun), "utf8");
    return { ok: true };
  });

export const getSetupHealth = createServerFn({method:"GET"}).handler(async()=>{
 const api=await fsApi(); if(!api)return {live:false,profile:false,resume:false,mcp:false,browser:false,notion:false,notionVerified:false};
 const read=async(p:string)=>api.fs.readFile(api.path.join(api.root,p),"utf8").catch(()=>"");
 const exists=async(p:string)=>api.fs.access(api.path.join(api.root,p)).then(()=>true).catch(()=>false);
 let verified=false;try{verified=FormAnswers.safeParse(parse(await read("context/form-answers.yaml"))).success}catch{}
 const profile=await read("context/profile.md"); const cv=await read("context/cv.md");
 let resume=false;try{resume=(await api.fs.readFile(api.path.join(api.root,"assets/resume.pdf"))).subarray(0,5).toString()==="%PDF-"}catch{}
 let mcp=false,notion=false;try{const c=JSON.parse(await read(".mcp.json"));mcp=!!c.mcpServers?.playwright?.args?.some((a:string)=>a.startsWith("--user-data-dir="));notion=!!c.mcpServers?.notion?.env?.NOTION_TOKEN}catch{}
 return {live:true,profile:verified&&!!profile&&!!cv&&!/example\.com|your-handle|Acme Fintech|Nile Commerce/i.test(profile+cv),resume,mcp,browser:await exists("browser-profile/Default"),notion,notionVerified:false};
});
export const initializeSetup = createServerFn({method:"POST"}).handler(async()=>{
 const api=await fsApi();if(!api)throw new Error("Setup is available in the local companion only.");
 for(const name of ["profile.md","cv.md","preferences.yaml","targets.yaml","form-answers.yaml"]){const path=api.path.join(api.root,"context",name);if(!await api.fs.access(path).then(()=>true).catch(()=>false))await api.fs.copyFile(path+".example",path);}
 await api.fs.mkdir(api.path.join(api.root,"assets"),{recursive:true});await api.fs.mkdir(api.path.join(api.root,"logs"),{recursive:true});
 const log=api.path.join(api.root,"logs/applications-log.json");if(!await api.fs.access(log).then(()=>true).catch(()=>false))await api.fs.writeFile(log,"[]\n",{mode:0o600});return {ok:true};
});
export const saveSetupProfile = createServerFn({method:"POST"}).inputValidator(z.object({name:z.string().min(1).max(200),email:z.string().email(),facts:z.string().min(1).max(20000)})).handler(async({data})=>{
 const api=await fsApi();if(!api)throw new Error("Profile editing is local-only.");
 const file=api.path.join(api.root,"context/profile.md");await api.fs.writeFile(file,`# Profile\n- full_name: ${data.name}\n- email: ${data.email}\n\n## Verified facts\n${data.facts}\n`,{mode:0o600});
 await api.fs.writeFile(api.path.join(api.root,"context/cv.md"),`# Verified CV\n${data.facts}\n`,{mode:0o600});return {ok:true};
});
export const saveRuntimeControls = createServerFn({method:"POST"}).inputValidator(RuntimeControls).handler(async({data})=>{
 const api=await fsApi();if(!api)throw new Error("Controls are read-only in hosted preview.");
 const path=api.path.join(api.root,"config/guardrails.yaml");const original=parse(await api.fs.readFile(path,"utf8"));const merged=Guardrails.parse({...original,...data});await api.fs.writeFile(path,stringify(merged),{mode:0o600});return {ok:true};
});
