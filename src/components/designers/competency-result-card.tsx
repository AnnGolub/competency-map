import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { CompetencyScoreRing } from "@/components/designers/competency-score-ring";
import {
  averageScore,
  formatScore,
  getExpectedScore,
  type Competency,
  type CompetencyItem,
  type ItemScore,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

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
  showPreLead,
}: {
  competency: Competency;
  items: CompetencyItem[];
  role: DesignerRole;
  scoresByItem: Record<string, ItemScore>;
  showPreLead: boolean;
}) {
  const itemScores = items.map((item) => {
    const s = scoresByItem[item.id]?.score;
    return s !== null && s !== undefined ? Number(s) : null;
  });
  const avg = averageScore(
    itemScores.filter((s): s is number => s !== null)
  );
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
            {showPreLead ? (
              <span className="inline-flex h-[22px] items-center justify-center rounded bg-app-input px-1 text-xs text-[#C7C9D9]">
                Готовится к лиду {formatScore(competency.expected_pre_lead)}
              </span>
            ) : null}
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
              <ItemScoreBadge score={scoresByItem[item.id]?.score} />
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
