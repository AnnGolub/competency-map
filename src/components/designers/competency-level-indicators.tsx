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
}: {
  competency: Competency;
}) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer list-none text-sm text-neutral-500 hover:text-neutral-700 [&::-webkit-details-marker]:hidden">
        <span className="border-b border-dotted border-neutral-300">
          Что означает каждый уровень
        </span>
      </summary>
      <ul className="mt-2 space-y-1.5 border-l border-neutral-200 pl-3 text-sm text-neutral-600">
        {LEVEL_ROWS.map(({ score, field }) => {
          const raw = competency[field];
          const text =
            typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "—";
          return (
            <li key={field} className="flex gap-2">
              <span className="shrink-0 tabular-nums text-neutral-400">
                {score}
              </span>
              <span className="min-w-0">{text}</span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
