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
    <article className="rounded-3xl bg-app-sidebar p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold leading-6 text-white">
              {competency.title}
            </h3>
            <CompetencyLevelIndicators competency={competency} theme="dark" />
          </div>
          {competency.description ? (
            <p className="mt-2 text-sm leading-5 text-app-placeholder">
              {competency.description}
            </p>
          ) : null}
          {!hideLevelBadges ? (
            <div className="mt-4 flex flex-wrap gap-1">
              {levelBadges.map((badge) => {
                const rawValue = competency[badge.field];
                const value =
                  badge.key === "lead" &&
                  (rawValue === null || Number(rawValue) === 0)
                    ? 4
                    : rawValue;
                if (value === null) return null;

                return (
                  <span
                    key={badge.key}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      badge.key === role
                        ? "bg-[#F5820D] text-white"
                        : "bg-app-input text-app-muted"
                    }`}
                  >
                    {badge.label} {Number(value).toFixed(1)}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
        <CompetencyScoreRing value={avg} />
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-6">
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
                  theme="dark"
                  variant="review"
                  onChange={(score) => onScoreChange(item.id, score)}
                />
              )}
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
