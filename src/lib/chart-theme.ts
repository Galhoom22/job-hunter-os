export const chartTheme = {
  grid: { stroke: "var(--border)", strokeDasharray: "3 3", vertical: false },
  axis: { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false },
  tooltip: {
    contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
    labelStyle: { color: "var(--foreground)" },
    cursor: { fill: "var(--accent)", opacity: 0.4 },
  },
  legend: { fontSize: 12, color: "var(--muted-foreground)" },
};
