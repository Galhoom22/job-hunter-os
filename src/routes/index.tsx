import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardQuery } from "@/lib/queries";
import { byPlatform, dailyTrend, kpis } from "@/lib/stats";
import { PageHeader, Panel } from "@/components/page-header";
import { SourceBadge } from "@/components/app-shell";
import { chartTheme } from "@/lib/chart-theme";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview — Job Hunter Console" }, { name: "description", content: "KPIs, platform breakdown and daily trend of your autonomous job hunting runs." }, { property: "og:title", content: "Overview — Job Hunter Console" }, { property: "og:description", content: "KPIs, platform breakdown and daily trend of your autonomous job hunting runs." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: Overview,
});

function Overview() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const k = kpis(data.applications);
  const cards = [
    { label: "Total scanned", value: k.scanned },
    { label: "Applied", value: k.applied },
    { label: "Avg match score", value: k.avgScore.toFixed(1) },
    { label: "Pending review", value: k.pending, warn: k.pending > 0 },
  ];
  return (
    <>
      <PageHeader title="Overview" subtitle="Everything your agent has scanned, scored and applied to." right={<SourceBadge live={data.live} />} />
      {data.invalidLog && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 font-mono text-xs text-destructive">
          applications-log.json failed validation: {data.invalidLog.join(" · ")}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-5 transition-shadow hover:shadow-glow">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className={`kpi-value mt-3 ${c.warn ? "text-warning" : "text-foreground"}`}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel title="By platform" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byPlatform(data.applications)}>
              <CartesianGrid {...chartTheme.grid} />
              <XAxis dataKey="platform" {...chartTheme.axis} />
              <YAxis {...chartTheme.axis} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend wrapperStyle={chartTheme.legend} />
              <Bar dataKey="scanned" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="applied" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Daily trend" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyTrend(data.applications)}>
              <CartesianGrid {...chartTheme.grid} />
              <XAxis dataKey="day" {...chartTheme.axis} />
              <YAxis {...chartTheme.axis} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend wrapperStyle={chartTheme.legend} />
              <Line type="monotone" dataKey="scanned" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="applied" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="avg" name="avg score" stroke="var(--chart-3)" strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </>
  );
}
