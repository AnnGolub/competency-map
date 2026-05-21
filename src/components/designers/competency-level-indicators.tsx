"use client";

import Image from "next/image";
import { useState } from "react";
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
  const scoreLabel = isDark ? "text-app-placeholder" : "text-neutral-400";
  const textCls = isDark ? "text-white/80" : "text-neutral-600";

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
          width={20}
          height={20}
          className="shrink-0"
        />
      </button>

      {open ? (
        <div
          role="tooltip"
          className="absolute left-full top-1/2 z-20 ml-2 w-[288px] -translate-y-1/2 rounded-xl border border-app-border bg-[#1E2130] p-4 shadow-lg"
        >
          <ul className={`space-y-2 text-sm ${textCls}`}>
            {LEVEL_ROWS.map(({ score, field }) => {
              const raw = competency[field];
              const text =
                typeof raw === "string" && raw.trim().length > 0
                  ? raw.trim()
                  : "—";
              return (
                <li key={field} className="flex gap-2">
                  <span className={`shrink-0 tabular-nums ${scoreLabel}`}>
                    {score}
                  </span>
                  <span className="min-w-0">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
