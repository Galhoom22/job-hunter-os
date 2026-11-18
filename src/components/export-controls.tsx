import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Application } from "../../schemas/index";
import { applicationsCSV,markdownReport } from "../../schemas/exports";
export function ExportControls({apps}:{apps:Application[]}) {
 const download=(type:"csv"|"json")=>{const content=type==="csv"?applicationsCSV(apps):JSON.stringify(apps,null,2);const url=URL.createObjectURL(new Blob([content],{type:type==="csv"?"text/csv;charset=utf-8":"application/json"}));const a=document.createElement("a");a.href=url;a.download=`applications.${type}`;a.click();URL.revokeObjectURL(url)};
 return <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={()=>download("csv")}><Download />Export CSV</Button><Button variant="outline" size="sm" onClick={()=>download("json")}><Download />Export JSON</Button><Button variant="outline" size="sm" onClick={async()=>{try{await navigator.clipboard.writeText(markdownReport(apps));toast.success("Markdown report copied")}catch{toast.error("Clipboard unavailable")}}}><Copy />Copy Markdown Report</Button></div>;
}
