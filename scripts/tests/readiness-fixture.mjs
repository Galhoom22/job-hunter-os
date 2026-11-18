import fs from 'node:fs';
import path from 'node:path';
import { sourceHash, gateKeys } from '../../bin/readiness.mjs';
export function readyFixture(root, now = new Date()) {
  const put = (file,text) => {fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),text);};
  put('context/profile.md','# Verified Candidate\n- full_name: Alex River\n- email: alex@verified.test\n- current_title: Engineer\n');
  put('context/cv.md','# Alex River\nBuilt documented products with React.\n');
  put('context/preferences.yaml','roles: [Engineer]\nseniority: [mid]\nwork_modes: [Remote]\nregions: [Egypt]\ntimezones: [UTC]\nblacklisted_companies: []\n');
  put('context/form-answers.yaml','owner_verified: true\nresume_pdf_path: "./assets/resume.pdf"\nquestions: []\nskills_years:\n  React: 2.5\neeo: {}\n');
  put('context/targets.yaml','targets:\n  - name: Verified board\n    platform: linkedin\n    enabled: true\n    url: https://www.linkedin.com/jobs/\n    auth_check_url: https://www.linkedin.com/feed/\n    auth_required: true\n    max_results: 10\n');
  put('assets/resume.pdf','%PDF-1.7 synthetic test fixture');
  const state={version:1,status:'READY_100%',overall_ready:true,updated_at:now.toISOString(),gates:Object.fromEntries(gateKeys.map(key=>[key,{complete:true,owner_confirmed:true,verified_at:now.toISOString(),missing:[]}])),source_hashes:{},requirements:{roles:['Engineer'],seniority:['mid'],work_modes:['Remote'],regions:['Egypt'],timezones:['UTC'],blacklisted_companies:[],salary:{minimum:3000,currency:'USD',period:'monthly'},notice_period:'30 days',earliest_start_date:'2026-12-01',work_authorization:'Egypt',visa_sponsorship:'Required outside Egypt',core_skills:['React']},sessions:[{platform:'linkedin',verified_at:now.toISOString(),evidence:'Named owner menu observed (synthetic test)',authenticated:true}]};
  for(const file of ['context/profile.md','context/cv.md','context/preferences.yaml','context/form-answers.yaml','context/targets.yaml','assets/resume.pdf'])state.source_hashes[file]=sourceHash(fs.readFileSync(path.join(root,file)));
  put('context/readiness-state.json',JSON.stringify(state));
  return state;
}
