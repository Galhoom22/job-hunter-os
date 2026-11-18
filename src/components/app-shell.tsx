import { Link } from "@tanstack/react-router";
import { BarChart3, Briefcase, History, Lightbulb, Settings2, Crosshair } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Overview", icon: BarChart3 },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/runs", label: "Runs", icon: History },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/config", label: "Config", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-glow">
            <Crosshair className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Job Hunter</div>
            <div className="font-mono text-[10px] text-muted-foreground">local console</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{ className: "bg-sidebar-accent !text-primary" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-md border border-sidebar-border p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
          Reads <span className="text-foreground">logs/</span> · <span className="text-foreground">context/</span> ·{" "}
          <span className="text-foreground">config/</span> from this repo.
        </div>
      </aside>
      <div className="flex-1">
        <nav className="flex gap-1 overflow-x-auto border-b p-2 md:hidden">
          {nav.map(({ to, label }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="rounded px-3 py-1.5 text-sm text-muted-foreground" activeProps={{ className: "bg-secondary !text-primary" }}>
              {label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-7xl p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

export function SourceBadge({ live }: { live: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-success" : "bg-warning"}`} />
      {live ? "live files" : "bundled demo snapshot"}
    </span>
  );
}
