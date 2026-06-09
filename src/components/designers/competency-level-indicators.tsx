"use client";

import { useState } from "react";
import { IconInformationCircle } from "@/components/ui/tabler-icons";
import { TooltipRightOf } from "@/components/ui/tooltip-bubble";
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
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <div
      className="relative inline-flex shrink-0 items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition-opacity hover:opacity-80"
        aria-label="Что означает каждый уровень"
        aria-expanded={open}
      >
        <IconInformationCircle
          className={`h-5 w-5 ${
            isDark ? "text-white" : "text-[rgba(60,60,67,0.66)]"
          }`}
        />
      </button>

      {open ? (
        <TooltipRightOf>
          {LEVEL_ROWS.map(({ score, field }) => {
            const raw = competency[field];
            const text =
              typeof raw === "string" && raw.trim().length > 0
                ? raw.trim()
                : "—";
            return (
              <p key={field} className="w-full">
                <span className="tabular-nums">{score}</span> {text}
              </p>
            );
          })}
        </TooltipRightOf>
      ) : null}
    </div>
  );
}
