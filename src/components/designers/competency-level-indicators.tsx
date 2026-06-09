"use client";

import Image from "next/image";
import { useState } from "react";
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
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded transition-opacity hover:opacity-80"
        aria-label="Что означает каждый уровень"
        aria-expanded={open}
      >
        <Image
          src="/icons/Information.svg"
          alt=""
          width={16}
          height={16}
          className={`shrink-0 ${isDark ? "" : "brightness-0 opacity-[0.66]"}`}
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
