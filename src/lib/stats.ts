import { Platform, type Application } from "../../schemas/index";

export const PLATFORMS = Platform.options;

export function kpis(apps: Application[]) {
  const applied = apps.filter((a) => a.status === "applied").length;
  const avg = apps.length ? apps.reduce((s, a) => s + a.match_score, 0) / apps.length : 0;
  return {
    scanned: apps.length,
    applied,
    avgScore: Math.round(avg * 10) / 10,
    pending: apps.filter((a) => a.status === "needs_review").length,
  };
}

export function byPlatform(apps: Application[]) {
  const m = new Map<string, { platform: string; scanned: number; applied: number }>();
  for (const a of apps) {
    const r = m.get(a.platform) ?? { platform: a.platform, scanned: 0, applied: 0 };
    r.scanned++;
    if (a.status === "applied") r.applied++;
    m.set(a.platform, r);
  }
  return [...m.values()].sort((a, b) => b.scanned - a.scanned);
}

export function dailyTrend(apps: Application[]) {
  const m = new Map<string, { day: string; scanned: number; applied: number; avg: number; _s: number }>();
  for (const a of apps) {
    const r = m.get(a.run_id) ?? { day: a.run_id, scanned: 0, applied: 0, avg: 0, _s: 0 };
    r.scanned++;
    r._s += a.match_score;
    if (a.status === "applied") r.applied++;
    m.set(a.run_id, r);
  }
  return [...m.values()]
    .sort((a, b) => a.day.localeCompare(b.day))
    .map(({ _s, ...r }) => ({ ...r, day: r.day.slice(5), avg: Math.round((_s / r.scanned) * 10) / 10 }));
}

export function skillCounts(apps: Application[]) {
  const demand = new Map<string, number>();
  const gaps = new Map<string, number>();
  for (const a of apps) {
    for (const s of [...a.matched_skills, ...a.missing_skills]) demand.set(s, (demand.get(s) ?? 0) + 1);
    for (const s of a.missing_skills) gaps.set(s, (gaps.get(s) ?? 0) + 1);
  }
  return [...demand.entries()]
    .map(([skill, count]) => ({ skill, demand: count, gap: gaps.get(skill) ?? 0 }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 12);
}
