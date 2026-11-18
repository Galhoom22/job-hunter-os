import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { FormAnswers } from "../schemas/index";
export function initializeContext(root:string) {
 mkdirSync(resolve(root,"context"),{recursive:true}); mkdirSync(resolve(root,"assets"),{recursive:true}); mkdirSync(resolve(root,"logs"),{recursive:true});
 for(const name of ["profile.md","cv.md","preferences.yaml","targets.yaml","form-answers.yaml"]) {const dest=resolve(root,"context",name); if(!existsSync(dest)) copyFileSync(dest+".example",dest);}
 const log=resolve(root,"logs/applications-log.json"); if(!existsSync(log)) writeFileSync(log,"[]\n",{mode:0o600});
}
export function setupHealth(root:string) {
 const read=(p:string)=>{try{return readFileSync(resolve(root,p),"utf8")}catch{return ""}};
 let verified=false;try{verified=FormAnswers.safeParse(parse(read("context/form-answers.yaml"))).success}catch{}
 let pdf=false;try{pdf=readFileSync(resolve(root,"assets/resume.pdf")).subarray(0,5).toString()==="%PDF-"}catch{}
 let mcp=false,notion=false;try{const c=JSON.parse(read(".mcp.json"));mcp=!!c.mcpServers?.playwright?.args?.some((a:string)=>a.startsWith("--user-data-dir="));notion=!!c.mcpServers?.notion?.env?.NOTION_TOKEN}catch{}
 return { profile:verified&&!!read("context/profile.md")&&!!read("context/cv.md")&&!/example\.com|your-handle|Acme Fintech|Nile Commerce/i.test(read("context/profile.md")+read("context/cv.md")),resume:pdf,mcp,browser:existsSync(resolve(root,"browser-profile/Default")),notion,notionVerified:false };
}
