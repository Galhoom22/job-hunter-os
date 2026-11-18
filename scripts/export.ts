import { readFileSync } from "node:fs";import { resolve } from "node:path";import { ApplicationsLog } from "../schemas/index";import { writeExports } from "./export-lib";
const root=resolve(import.meta.dirname,"..");writeExports(root,ApplicationsLog.parse(JSON.parse(readFileSync(resolve(root,"logs/applications-log.json"),"utf8"))));console.log("Private exports saved under logs/exports.");
