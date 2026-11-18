import { z } from "zod";
export const VerifiedResume = z.object({ owner_verified:z.literal(true), full_name:z.string().min(1), contact:z.string().min(1), headline:z.string().min(1), summary_facts:z.array(z.string().min(1)).min(1), skills:z.array(z.string().min(1)), experience:z.array(z.object({ employer:z.string(),role:z.string(),dates:z.string(),bullets:z.array(z.string().min(1)) })), education:z.array(z.string()) });
export function tailorResume(profile: z.infer<typeof VerifiedResume>, keywords: string[]) {
 const terms=keywords.map(k=>k.toLowerCase()).filter(Boolean);
 const rank=(s:string)=>terms.filter(k=>s.toLowerCase().includes(k)).length;
 const order=(items:string[])=>items.map((value,index)=>({value,index})).sort((a,b)=>rank(b.value)-rank(a.value)||a.index-b.index).map(x=>x.value);
 return {...profile,summary_facts:order(profile.summary_facts),skills:order(profile.skills),experience:profile.experience.map(e=>({...e,bullets:order(e.bullets)}))};
}
export function escapeHTML(s:string) {return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]??c));}
export function resumeBody(p:z.infer<typeof VerifiedResume>) {const e=escapeHTML;return `<h1>${e(p.full_name)}</h1><p>${e(p.contact)}</p><h2>${e(p.headline)}</h2><p>${p.summary_facts.map(e).join(" ")}</p><h2>Skills</h2><p>${p.skills.map(e).join(" · ")}</p><h2>Experience</h2>`+p.experience.map(x=>`<h3>${e(x.role)} — ${e(x.employer)}</h3><p>${e(x.dates)}</p><ul>${x.bullets.map(b=>`<li>${e(b)}</li>`).join("")}</ul>`).join("")+`<h2>Education</h2><p>${p.education.map(e).join("<br>")}</p>`;}
