import { resolve } from "node:path";
import { readFileSync,writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin,stdout } from "node:process";
import { parse,stringify } from "yaml";
import { execFileSync } from "node:child_process";
import { initializeContext,setupHealth } from "./setup-lib";
const root=resolve(import.meta.dirname,"..");
if(process.argv.includes("--check")){const h=setupHealth(root);console.log(JSON.stringify(h,null,2));process.exit(h.profile&&h.resume&&h.mcp&&h.browser?0:1);}
initializeContext(root);
if(!stdin.isTTY){console.log("Templates initialized without overwriting existing files. Run npm run setup in a terminal to answer prompts.");process.exit(0);}
const rl=createInterface({input:stdin,output:stdout});
try {
 const ide=await rl.question("Preferred IDE(s): Antigravity, Cursor, Claude Code, Windsurf, Cline, Copilot: ");
 const name=await rl.question("Full name: ");const email=await rl.question("Email: "); const location=await rl.question("Location: ");
 const cv=await rl.question("Paste a one-line verified career summary (no invented facts): ");
 const overwrite=await rl.question("Replace profile/CV with these facts (y/N)? ");
 if(name&&email&&cv&&overwrite.toLowerCase()==="y"){writeFileSync(resolve(root,"context/profile.md"),`# Profile\n- full_name: ${name}\n- email: ${email}\n- location: ${location}\n\n## Verified facts\n${cv}\n`,{mode:0o600});writeFileSync(resolve(root,"context/cv.md"),`# Verified CV\n${cv}\n`,{mode:0o600});}
 const answerFile=resolve(root,"context/form-answers.yaml");const existing=parse(readFileSync(answerFile,"utf8"));
 // Never certify template legal/experience answers just from entering contact details.
 if(existing.owner_verified!==true && /Example facts below/.test(readFileSync(answerFile,"utf8")))writeFileSync(answerFile,stringify({owner_verified:false,resume_pdf_path:"./assets/resume.pdf",questions:[],skills_years:{},eeo:{}}),{mode:0o600});
 const prefFile=resolve(root,"context/preferences.yaml");const pref=parse(readFileSync(prefFile,"utf8"));pref.preferred_ides=ide.split(",").map(s=>s.trim()).filter(Boolean);writeFileSync(prefFile,stringify(pref),{mode:0o600});
 const guardsFile=resolve(root,"config/guardrails.yaml");const guards=parse(readFileSync(guardsFile,"utf8"));guards.active_hours.timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;writeFileSync(guardsFile,stringify(guards));
 const targetsFile=resolve(root,"context/targets.yaml");const targets=parse(readFileSync(targetsFile,"utf8"));const enable=await rl.question("Enable public WeWorkRemotely discovery (y/N)? ");if(enable.toLowerCase()==="y"){const t=targets.targets.find((t:{platform:string})=>t.platform==="weworkremotely");if(t)t.enabled=true;writeFileSync(targetsFile,stringify(targets),{mode:0o600});}
 execFileSync(process.platform==="win32"?"npm.cmd":"npm",["run","sync:mcp"],{cwd:root,stdio:"inherit"});
 console.log("Drop your base PDF at assets/resume.pdf. Review/verify legal and experience answers before owner_verified:true. Notion is optional. Run npm run dev for health status; npm run browser:login for manual sign-in.");
} finally {rl.close()}
if(process.argv.includes("--login"))execFileSync(process.platform==="win32"?"npm.cmd":"npm",["run","browser:login"],{cwd:root,stdio:"inherit"});
