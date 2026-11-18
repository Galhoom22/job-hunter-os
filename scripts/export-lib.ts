import { mkdirSync,writeFileSync,readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { StorageAdapters } from "../schemas/runtime";
import { applicationsCSV,markdownReport } from "../schemas/exports";
import type { Application } from "../schemas/index";
export function writeExports(root:string,apps:Application[]) {const prefs=parse(readFileSync(resolve(root,"config/guardrails.yaml"),"utf8"));const adapters=StorageAdapters.parse(prefs.storage_adapters??{});const dir=resolve(root,"logs/exports");mkdirSync(dir,{recursive:true});if(adapters.csv_export)writeFileSync(resolve(dir,"applications.csv"),applicationsCSV(apps),{mode:0o600});if(adapters.markdown_report)writeFileSync(resolve(dir,"summary.md"),markdownReport(apps),{mode:0o600});}
