import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  applied: "bg-success/15 text-success border-success/30",
  dry_run: "bg-info/15 text-info border-info/30",
  needs_review: "bg-warning/15 text-warning border-warning/30",
  skipped: "bg-muted text-muted-foreground border-border",
  discovered: "bg-muted text-muted-foreground border-border",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  aborted: "bg-destructive/15 text-destructive border-destructive/30",
  completed: "bg-success/15 text-success border-success/30",
  running: "bg-info/15 text-info border-info/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide", styles[status])}>
      {status.replace("_", " ")}
    </span>
  );
}
