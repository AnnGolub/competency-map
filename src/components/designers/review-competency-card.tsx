"use client";

import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { ItemScoreSlider } from "@/components/ui/item-score-slider";
import {
  averageScore,
  formatScore,
  getExpectedScore,
  type Competency,
  type CompetencyItem,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

function CompetencyScoreRing({ value }: { value: number | null }) {
  const size = 64;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress =
    value !== null ? Math.min(1, Math.max(0, value / 4)) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2D3A"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3E7BFA"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg leading-6 tabular-nums text-white">
        {formatScore(value)}
      </span>
    </div>
  );
}

export function ReviewCompetencyCard({
  competency,
  items,
  role,
  form,
  onScoreChange,
  showPreLead,
}: {
  competency: Competency;
  items: CompetencyItem[];
  role: DesignerRole;
  form: Record<string, number>;
  onScoreChange: (itemId: string, score: number) => void;
  showPreLead: boolean;
}) {
  const itemScores = items.map((item) => form[item.id]);
  const avg = averageScore(itemScores);
  const expected = getExpectedScore(competency, role);

  return (
    <article className="rounded-3xl bg-app-sidebar p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="text-lg font-bold leading-6 text-white">
              {competency.title}
            </h3>
          </div>
          {competency.description ? (
            <p className="mt-2 text-sm leading-5 text-app-placeholder">
              {competency.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex h-[22px] items-center justify-center rounded bg-[#E57A00] px-1 text-xs text-white">
              Ожидается {formatScore(expected)}
            </span>
            {showPreLead ? (
              <span className="inline-flex h-[22px] items-center justify-center rounded bg-app-input px-1 text-xs text-[#C7C9D9]">
                Готовится к лиду {formatScore(competency.expected_pre_lead)}
              </span>
            ) : null}
          </div>
        </div>
        <CompetencyScoreRing value={avg} />
      </div>

      <CompetencyLevelIndicators competency={competency} theme="dark" />

      {items.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-6">
          {items.map((item) => (
            <li key={item.id}>
              <ItemScoreSlider
                id={`review-${item.id}`}
                label={item.text}
                value={form[item.id]}
                expected={null}
                theme="dark"
                variant="review"
                onChange={(score) => onScoreChange(item.id, score)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-app-placeholder">
          Нет подпунктов для оценки
        </p>
      )}
    </article>
  );
}
