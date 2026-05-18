"use client";

import type { Competency } from "@/lib/competency-utils";

type IndicatorField =
  | "indicators_1"
  | "indicators_2"
  | "indicators_3"
  | "indicators_4";

const LEVEL_ROWS: { score: string; field: IndicatorField }[] = [
  { score: "1.0", field: "indicators_1" },
  { score: "2.0", field: "indicators_2" },
  { score: "3.0", field: "indicators_3" },
  { score: "4.0", field: "indicators_4" },
];

export function CompetencyLevelIndicators({
  competency,
  theme = "light",
}: {
  competency: Competency;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const summary = isDark
    ? "text-app-muted hover:text-white border-neutral-600"
    : "text-neutral-500 hover:text-neutral-700 border-neutral-300";
  const list = isDark
    ? "border-app-border text-white/80"
    : "border-neutral-200 text-neutral-600";
  const scoreLabel = isDark ? "text-app-muted" : "text-neutral-400";

  return (
    <details className="mt-3">
      <summary
        className={`cursor-pointer list-none text-sm [&::-webkit-details-marker]:hidden ${summary}`}
      >
        <span className={`border-b border-dotted`}>Что означает каждый уровень</span>
      </summary>
      <ul className={`mt-2 space-y-1.5 border-l pl-3 text-sm ${list}`}>
        {LEVEL_ROWS.map(({ score, field }) => {
          const raw = competency[field];
          const text =
            typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "—";
          return (
            <li key={field} className="flex gap-2">
              <span className={`shrink-0 tabular-nums ${scoreLabel}`}>{score}</span>
              <span className="min-w-0">{text}</span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
