import { chromium } from "playwright";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { Targets } from "../schemas/index";
const root=resolve(import.meta.dirname,"..");
try {const targets=Targets.parse(parse(readFileSync(resolve(root,"context/targets.yaml"),"utf8"))).targets.filter(t=>t.enabled);
 const context=await chromium.launchPersistentContext(resolve(root,"browser-profile"),{headless:false});
 const urls=[...new Set(targets.map(t=>t.auth_check_url))];
 for(const url of urls.length?urls:["https://www.linkedin.com/login"]){const page=await context.newPage();await page.goto(url);await new Promise(r=>setTimeout(r,3000));}
 console.log("Log in manually; complete any 2FA yourself. Close Chromium when done. Do not run MCP against this profile simultaneously.");
 await new Promise<void>(r=>context.on("close",()=>r()));
}catch{console.error("Browser login unavailable. Install Chromium with npx playwright install chromium and close any browser using this profile.");process.exit(1)}
