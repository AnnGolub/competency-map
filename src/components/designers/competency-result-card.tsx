import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { CompetencyScoreRing } from "@/components/designers/competency-score-ring";
import {
  averageScore,
  formatScore,
  type Competency,
  type CompetencyItem,
  type ItemScore,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

const LEVEL_BADGES = [
  { key: "junior", label: "Junior", field: "expected_junior" },
  { key: "middle", label: "Middle", field: "expected_middle" },
  { key: "senior", label: "Senior", field: "expected_senior" },
  { key: "lead", label: "Lead", field: "expected_lead" },
] as const;

function ItemScoreBadge({ score }: { score: number | null | undefined }) {
  const display =
    score !== null && score !== undefined ? Number(score).toFixed(1) : "—";

  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-input text-sm font-semibold tabular-nums text-white">
      {display}
    </span>
  );
}

export function CompetencyResultCard({
  competency,
  items,
  role,
  scoresByItem,
}: {
  competency: Competency;
  items: CompetencyItem[];
  role: DesignerRole;
  scoresByItem: Record<string, ItemScore>;
}) {
  const itemScores = items.map((item) => {
    const row = scoresByItem[item.id];
    const s =
      row?.final_score !== null && row?.final_score !== undefined
        ? row.final_score
        : row?.score;
    return s !== null && s !== undefined ? Number(s) : null;
  });
  const avg = averageScore(
    itemScores.filter((s): s is number => s !== null)
  );

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
          <div className="mt-4 flex flex-wrap gap-1">
            {LEVEL_BADGES.map((badge) => {
              const value = competency[badge.field];
              if (value === null) return null;

              return (
                <span
                  key={badge.key}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    badge.key === role
                      ? "bg-[#E57A00] text-white"
                      : "bg-app-input text-app-muted"
                  }`}
                >
                  {badge.key === role
                    ? `Ожидается для ${badge.label} ${formatScore(value)}`
                    : `${badge.label} ${formatScore(value)}`}
                </span>
              );
            })}
          </div>
        </div>
        <CompetencyScoreRing value={avg} />
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4"
            >
              <p className="min-w-0 flex-1 text-sm leading-[18px] text-app-placeholder">
                {item.text}
              </p>
              <ItemScoreBadge
                score={
                  scoresByItem[item.id]?.final_score ??
                  scoresByItem[item.id]?.score
                }
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
