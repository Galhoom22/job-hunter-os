import { createServerFn } from "@tanstack/react-start";
import { parse } from "yaml";
import { z } from "zod";
import { setDryRunInText } from "./yaml-edit";
import { ApplicationsLog, DailyRun, Insight } from "../../schemas/index";

// Bundled snapshot of the repo files — used when the real filesystem is unavailable
// (hosted preview). Locally, `npm run dev` reads the live files on every request.
const bundledAppsGlob = import.meta.glob("../../logs/applications-log.json", { eager: true, import: "default" });
const bundledApps = Object.values(bundledAppsGlob)[0] ?? [];
const bundledRuns = import.meta.glob("../../logs/runs/*.json", { eager: true, import: "default" });
const bundledInsights = import.meta.glob("../../logs/insights/*.json", { eager: true, import: "default" });
const bundledText = import.meta.glob(
  ["../../context/targets.yaml", "../../context/form-answers.yaml", "../../config/guardrails.yaml"],
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const EDITABLE = {
  targets: "context/targets.yaml",
  formAnswers: "context/form-answers.yaml",
  guardrails: "config/guardrails.yaml",
} as const;
type EditableKey = keyof typeof EDITABLE;

async function fsApi() {
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
    .map((r) => r.data!)
    .sort((a, b) => b.run_id.localeCompare(a.run_id));
  const insights = (await readJsonDir("logs/insights", bundledInsights))
    .map((r) => Insight.safeParse(r))
    .filter((r) => r.success)
    .map((r) => r.data!);
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
  if (api) return api.fs.readFile(api.path.join(api.root, EDITABLE[key]), "utf8");
  return bundledText[`../../${EDITABLE[key]}`] ?? "";
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
    parse(data.content); // throws on invalid YAML
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
    await api.fs.writeFile(file, setDryRunInText(await api.fs.readFile(file, "utf8"), data.dryRun), "utf8");
    return { ok: true };
  });
