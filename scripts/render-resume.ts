import { chromium } from "playwright";
import { readFileSync,writeFileSync,mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { VerifiedResume,tailorResume,resumeBody } from "../schemas/resume";
const root=resolve(import.meta.dirname,"..");const [company,role,...keywords]=process.argv.slice(2);
try {if(!company||!role)throw new Error("Missing company/role");
 const facts=VerifiedResume.parse(JSON.parse(readFileSync(resolve(root,"context/resume-facts.json"),"utf8")));
 const tailored=tailorResume(facts,keywords);const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,80)||"role";
 const dir=resolve(root,"logs/resumes");mkdirSync(dir,{recursive:true});const file=resolve(dir,`${slug(company)}-${slug(role)}-${new Date().toISOString().slice(0,10)}.pdf`);
 const browser=await chromium.launch({headless:true});try{const page=await browser.newPage();await page.route("**/*",route=>route.abort());await page.setContent(readFileSync(resolve(root,"templates/ats-resume.html"),"utf8").replace("{{BODY}}",resumeBody(tailored)));await page.pdf({path:file,format:"A4",printBackground:false});}finally{await browser.close()}
 writeFileSync(file+".json",JSON.stringify({source:"context/resume-facts.json",keywords,verified_only:true},null,2),{mode:0o600});console.log(`Tailored PDF: ${file}`);
}catch{console.error("Resume rejected: provide owner-verified facts, company/role and installed Chromium. No invented content or static fallback.");process.exit(1)}
