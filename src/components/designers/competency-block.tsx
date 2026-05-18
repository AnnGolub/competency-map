import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { GapBadgePill } from "@/components/ui/gap-badge";
import { DualScoreProgress } from "@/components/ui/dual-score-progress";
import {
  formatScore,
  getExpectedScore,
  getGapBadge,
  primaryVisibleScore,
  resolveBlindScoresFromItems,
  showPreLeadColumn,
  type Competency,
  type CompetencyItem,
  type ItemScore,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

export function CompetencyBlockSection({
  title,
  competencies,
  role,
  itemsByCompetency,
  scoresByItem,
  selfReviewCompleted,
  isAdmin = false,
}: {
  title: string;
  competencies: Competency[];
  role: DesignerRole;
  itemsByCompetency: Map<string, CompetencyItem[]>;
  scoresByItem: Map<string, ItemScore>;
  selfReviewCompleted: boolean;
  isAdmin?: boolean;
}) {
  if (competencies.length === 0) return null;

  const preLead = showPreLeadColumn(role) && isAdmin;

  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
        {title}
      </h2>
      <ul className="mt-4 divide-y divide-neutral-200 border-y-[0.5px] border-neutral-200">
        {competencies.map((competency) => {
          const items = itemsByCompetency.get(competency.id) ?? [];
          const blind = resolveBlindScoresFromItems(
            items,
            scoresByItem,
            selfReviewCompleted
          );
          const expected = getExpectedScore(competency, role);
          const primary = primaryVisibleScore(blind);
          const badge = getGapBadge(primary, expected);

          return (
            <li key={competency.id} className="py-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="font-medium">{competency.title}</p>
                  <div className="mt-2">
                    <DualScoreProgress
                      leadScore={blind.leadScore}
                      selfScore={blind.selfScore}
                      showDual={blind.showDual}
                    />
                  </div>
                  <CompetencyLevelIndicators competency={competency} />
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-4 text-sm sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">Ожидается</p>
                    <p className="tabular-nums">{formatScore(expected)}</p>
                  </div>
                  {preLead ? (
                    <div className="text-right">
                      <p className="text-xs text-neutral-400">
                        Готовится к лиду
                      </p>
                      <p className="tabular-nums">
                        {formatScore(competency.expected_pre_lead)}
                      </p>
                    </div>
                  ) : null}
                  <GapBadgePill label={badge.label} variant={badge.variant} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
