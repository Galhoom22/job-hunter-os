import { ExportControls } from "@/components/export-controls";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardQuery } from "@/lib/queries";
import { skillCounts } from "@/lib/stats";
import { PageHeader, Panel } from "@/components/page-header";
import { chartTheme } from "@/lib/chart-theme";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Insights — Job Hunter Console" }, { name: "description", content: "Top demanded skills versus your CV gaps, plus weekly and monthly market reports." }, { property: "og:title", content: "Insights — Job Hunter Console" }, { property: "og:description", content: "Top demanded skills versus your CV gaps, plus weekly and monthly market reports." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: Insights,
});

function Insights() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const skills = skillCounts(data.applications);
  const reports = [...data.insights].sort((a, b) => a.type.localeCompare(b.type) || b.period.localeCompare(a.period));
  return (
    <>
      <PageHeader title="Insights" subtitle="What the market asks for, and where your CV falls short." />
      <div className="mb-4"><ExportControls apps={data.applications} /></div>
      <Panel title="Demanded skills vs. your gaps">
        <ResponsiveContainer width="100%" height={Math.max(260, skills.length * 30)}>
          <BarChart data={skills} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid {...chartTheme.grid} horizontal={false} vertical />
            <XAxis type="number" {...chartTheme.axis} />
            <YAxis type="category" dataKey="skill" {...chartTheme.axis} width={110} />
            <Tooltip {...chartTheme.tooltip} />
            <Legend wrapperStyle={chartTheme.legend} />
            <Bar dataKey="demand" name="appears in roles" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="gap" name="missing from CV" fill="var(--chart-5)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {reports.map((r) => (
          <Panel key={r.type + r.period}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold capitalize">{r.type} report</h2>
              <span className="font-mono text-xs text-muted-foreground">{r.period}</span>
            </div>
            <div className="mb-5 grid grid-cols-3 gap-3 font-mono">
              <Stat label="scanned" value={r.scanned} />
              <Stat label="match rate" value={`${Math.round(r.match_rate * 100)}%`} />
              <Stat label="avg score" value={r.avg_match_score.toFixed(1)} />
            </div>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {r.skill_gaps.map((g) => (
                <span key={g.skill} className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{g.skill} · {g.count}</span>
              ))}
            </div>
            <ul className="space-y-2 text-sm">
              {r.recommendations.map((t) => <li key={t} className="flex gap-2"><span className="text-primary">→</span>{t}</li>)}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-secondary p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
