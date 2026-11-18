import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dashboardQuery } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/runs")({
  head: () => ({ meta: [{ title: "Runs — Job Hunter Console" }, { name: "description", content: "Journal of each daily agent run: counts, platforms, errors and steps." }, { property: "og:title", content: "Runs — Job Hunter Console" }, { property: "og:description", content: "Journal of each daily agent run: counts, platforms, errors and steps." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: Runs,
});

function Runs() {
  const { data } = useSuspenseQuery(dashboardQuery);
  return (
    <>
      <PageHeader title="Runs" subtitle="One entry per daily run, newest first." />
      <div className="space-y-3">
        {data.runs.map((r) => (
          <details key={r.run_id} className="group rounded-lg border bg-card">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 p-4">
              <span className="font-mono text-sm font-semibold">{r.run_id}</span>
              <StatusBadge status={r.status} />
              {r.dry_run && <StatusBadge status="dry_run" />}
              <span className="font-mono text-xs text-muted-foreground">{r.platforms.join(" · ")}</span>
              <span className="ml-auto flex gap-4 font-mono text-xs">
                <span>scanned <b className="text-foreground">{r.counts.scanned}</b></span>
                <span className="text-success">applied {r.counts.applied}</span>
                <span className="text-info">dry run {r.counts.dry_run}</span>
                <span className="text-warning">review {r.counts.needs_review}</span>
                {r.errors.length > 0 && <span className="text-destructive">errors {r.errors.length}</span>}
              </span>
            </summary>
            <div className="border-t p-4 font-mono text-xs">
              {r.steps.map((s, i) => (
                <div key={i} className="flex gap-4 py-1">
                  <span className="text-muted-foreground">{s.at.slice(11, 19)}</span>
                  <span className="text-primary">{s.step}</span>
                  <span className="text-muted-foreground">{s.detail}</span>
                </div>
              ))}
              {r.errors.map((e) => <div key={e} className="py-1 text-destructive">! {e}</div>)}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
