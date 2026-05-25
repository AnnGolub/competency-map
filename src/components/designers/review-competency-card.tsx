"use client";

import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { CompetencyScoreRing } from "@/components/designers/competency-score-ring";
import { ItemScoreSlider } from "@/components/ui/item-score-slider";
import {
  averageScore,
  formatScore,
  getExpectedScore,
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
}: {
  competency: Competency;
  items: CompetencyItem[];
  role: DesignerRole;
  form: Record<string, number>;
  onScoreChange: (itemId: string, score: number) => void;
}) {
  const itemScores = items.map((item) => form[item.id]);
  const avg = averageScore(itemScores);
  const expected = getExpectedScore(competency, role);

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
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex h-[22px] items-center justify-center rounded bg-[#E57A00] px-1 text-xs text-white">
              Ожидается {formatScore(expected)}
            </span>
          </div>
        </div>
        <CompetencyScoreRing value={avg} />
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-6">
          {items.map((item) => (
            <li key={item.id}>
              <ItemScoreSlider
                id={`review-${item.id}`}
                label={item.text}
                value={form[item.id]}
                expected={null}
                helperContent={
                  <div className="mt-1 flex flex-wrap gap-1">
                    {LEVEL_BADGES.map((badge) => {
                      const value = item[badge.field];
                      if (value === null) return null;

                      return (
                        <span
                          key={badge.key}
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            badge.key === role
                              ? "bg-app-accent text-white"
                              : "bg-app-input text-app-muted"
                          }`}
                        >
                          {badge.label} {Number(value).toFixed(1)}
                        </span>
                      );
                    })}
                  </div>
                }
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
