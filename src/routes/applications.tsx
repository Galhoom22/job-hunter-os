import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { dashboardQuery } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Applications — Job Hunter Console" }, { name: "description", content: "Filterable table of every job your agent scanned, with match scores, status and skill gaps." }, { property: "og:title", content: "Applications — Job Hunter Console" }, { property: "og:description", content: "Filterable table of every job your agent scanned, with match scores, status and skill gaps." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: Applications,
});

function scoreClass(s: number) {
  return s >= 7 ? "text-success" : s >= 5 ? "text-warning" : "text-muted-foreground";
}

function Applications() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const platforms = [...new Set(data.applications.map((a) => a.platform))];
  const rows = useMemo(
    () =>
      data.applications
        .filter((a) => status === "all" || a.status === status)
        .filter((a) => platform === "all" || a.platform === platform)
        .filter((a) => !q || `${a.title} ${a.company} ${a.location}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.discovered_at.localeCompare(a.discovered_at)),
    [data.applications, q, status, platform],
  );
  return (
    <>
      <PageHeader title="Applications" subtitle={`${rows.length} of ${data.applications.length} jobs`} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search title, company, location…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "applied", "dry_run", "needs_review", "skipped", "failed"].map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>{["Role", "Platform", "Score", "Status", "Missing skills", "Date", ""].map((h) => <th key={h} className="px-4 py-3 text-left font-normal">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.job_id} className="border-b last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.company} · {a.location}</div>
                  {a.open_questions.length > 0 && <div className="mt-1 text-xs text-warning">? {a.open_questions[0]?.question}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{a.platform}</td>
                <td className={`px-4 py-3 font-mono font-semibold ${scoreClass(a.match_score)}`}>{a.match_score.toFixed(1)}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.missing_skills.length === 0 ? <span className="text-xs text-muted-foreground">—</span> :
                      a.missing_skills.map((s) => <span key={s} className="rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] text-destructive">{s}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.run_id}</td>
                <td className="px-4 py-3">
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary" aria-label={`Open ${a.title} posting`}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
