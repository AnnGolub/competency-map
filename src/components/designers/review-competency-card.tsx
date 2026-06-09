"use client";

import type { ReactNode } from "react";
import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { CompetencyScoreRing } from "@/components/designers/competency-score-ring";
import { ItemScoreSlider } from "@/components/ui/item-score-slider";
import {
  averageScore,
  type Competency,
  type CompetencyItem,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

const LEVEL_BADGES = [
  { key: "junior", label: "Junior", field: "expected_junior" },
  { key: "middle", label: "Middle", field: "expected_middle" },
  { key: "senior", label: "Senior", field: "expected_senior" },
  { key: "lead", label: "Lead", field: "expected_lead" },
] as const;

export function ReviewCompetencyCard({
  competency,
  items,
  role,
  form,
  onScoreChange,
  hideLevelBadges = false,
  renderItem,
}: {
  competency: Competency;
  items: Pick<CompetencyItem, "id" | "text">[];
  role: DesignerRole;
  form: Record<string, number | null | undefined>;
  onScoreChange: (itemId: string, score: number) => void;
  hideLevelBadges?: boolean;
  renderItem?: (item: Pick<CompetencyItem, "id" | "text">) => ReactNode;
}) {
  const itemScores = items.map((item) => form[item.id]);
  const avg = averageScore(
    itemScores.filter((score): score is number => score !== null && score !== undefined)
  );
  const levelBadges = LEVEL_BADGES.filter(({ key }) => {
    if (competency.block === "leadership") {
      return key === "senior" || key === "lead";
    }
    return true;
  });

  return (
    <article className="flex flex-col gap-6 rounded-[24px] bg-[#F2F3F5] p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-sf text-lg font-bold leading-6 tracking-[0.38px] text-[rgba(3,3,6,0.88)]">
              {competency.title}
            </h3>
            <CompetencyLevelIndicators competency={competency} theme="light" />
          </div>
          {competency.description ? (
            <p className="font-sf mt-2 text-sm font-normal leading-5 tracking-[-0.08px] text-[rgba(4,4,19,0.55)]">
              {competency.description}
            </p>
          ) : null}
          {!hideLevelBadges ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {levelBadges.map((badge) => {
                const rawValue = competency[badge.field];
                const value =
                  badge.key === "lead" &&
                  (rawValue === null || Number(rawValue) === 0)
                    ? 4
                    : rawValue;
                if (value === null) return null;

                const isCurrentRole = badge.key === role;

                return (
                  <span
                    key={badge.key}
                    className="rounded-[6px] px-2 py-0.5 text-[11px] font-bold uppercase text-[rgba(255,255,255,0.94)]"
                    style={{
                      background: isCurrentRole ? "#FA9313" : "#898991",
                    }}
                  >
                    {badge.label} {Number(value).toFixed(1)}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
        <CompetencyScoreRing value={avg} theme="light" />
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-6">
          {items.map((item) => (
            <li key={item.id}>
              {renderItem ? (
                renderItem(item)
              ) : (
                <ItemScoreSlider
                  id={`review-${item.id}`}
                  label={item.text}
                  value={form[item.id] ?? 2}
                  expected={null}
                  theme="light"
                  variant="review"
                  indicators={{
                    indicators_1: competency.indicators_1,
                    indicators_2: competency.indicators_2,
                    indicators_3: competency.indicators_3,
                    indicators_4: competency.indicators_4,
                  }}
                  onChange={(score) => onScoreChange(item.id, score)}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-sf text-sm text-[rgba(4,4,19,0.55)]">
          Нет подпунктов для оценки
        </p>
      )}
    </article>
  );
}
