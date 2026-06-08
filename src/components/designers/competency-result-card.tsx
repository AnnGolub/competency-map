import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
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
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2F3F5] text-sm font-semibold tabular-nums text-[rgba(3,3,6,0.88)]">
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
                  className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase text-[rgba(255,255,255,0.94)]"
                  style={{
                    background: isCurrentRole ? "#FA9313" : "#898991",
                  }}
                >
                  {badge.label} {Number(value).toFixed(1)}
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#212124]">
          <span className="font-sf text-lg leading-6 tabular-nums text-[rgba(255,255,255,0.94)]">
            {formatScore(avg)}
          </span>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-6">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4"
            >
              <p className="font-sf min-w-0 flex-1 text-sm leading-[18px] text-[rgba(3,3,6,0.88)]">
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
        <p className="font-sf text-sm text-[rgba(4,4,19,0.55)]">
          Нет подпунктов для оценки
        </p>
      )}
    </article>
  );
}
