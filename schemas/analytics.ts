import type { Application, Insight } from "./index";
export function summarizePeriod(apps: Application[], type: "weekly" | "monthly", period: string, start: string, end: string, generatedAt: string): Insight {
  const rows = [...new Map(apps.filter(a => a.discovered_at >= start && a.discovered_at < end).map(a => [a.job_id, a])).values()];
  const demanded = new Map<string, number>();
  const gaps = new Map<string, number>();
  for (const a of rows) {
    for (const s of new Set([...a.matched_skills, ...a.missing_skills])) demanded.set(s, (demanded.get(s) ?? 0) + 1);
    for (const s of new Set(a.missing_skills)) gaps.set(s, (gaps.get(s) ?? 0) + 1);
  }
  const top = (m: Map<string, number>) => [...m].map(([skill,count]) => ({skill,count})).sort((a,b) => b.count-a.count).slice(0,10);
  const skill_gaps = top(gaps);
  return { type, period, generated_at: generatedAt, scanned: rows.length,
    applied: rows.filter(a => a.status === "applied").length,
    match_rate: rows.length ? rows.filter(a => a.match_score >= 7).length / rows.length : 0,
    avg_match_score: rows.length ? rows.reduce((s,a) => s+a.match_score,0) / rows.length : 0,
    top_skills: top(demanded), skill_gaps, notion_synced: false,
    recommendations: [...skill_gaps.slice(0,3).map(g => `Consider a truthful ${g.skill} learning/project plan: missing in ${g.count}/${rows.length} scored roles; add to CV only after real experience.`),
      `Sample: ${rows.length} unique roles in this period; this is not a whole-market estimate.`],
  };
}
