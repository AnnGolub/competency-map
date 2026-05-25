import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { GapBadgePill } from "@/components/ui/gap-badge";
import { DualScoreProgress } from "@/components/ui/dual-score-progress";
import {
  formatScore,
  getExpectedScore,
  getGapBadge,
  primaryVisibleScore,
  resolveBlindScoresFromItems,
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
  theme = "light",
}: {
  title: string;
  competencies: Competency[];
  role: DesignerRole;
  itemsByCompetency: Map<string, CompetencyItem[]>;
  scoresByItem: Map<string, ItemScore>;
  selfReviewCompleted: boolean;
  theme?: "light" | "dark";
}) {
  if (competencies.length === 0) return null;

  const isDark = theme === "dark";
  const sectionTitle = isDark
    ? "text-app-muted"
    : "text-neutral-400 uppercase tracking-wide";
  const divide = isDark ? "divide-app-border border-app-border" : "divide-neutral-200 border-neutral-200";
  const titleCls = isDark ? "font-medium text-white" : "font-medium";
  const metaLabel = isDark ? "text-app-muted" : "text-neutral-400";
  const metaValue = isDark ? "text-white/90 tabular-nums" : "tabular-nums";

  return (
    <section className="mt-10">
      <h2 className={`text-sm font-medium ${sectionTitle}`}>{title}</h2>
      <ul className={`mt-4 divide-y border-y-[0.5px] ${divide}`}>
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
                  <p className={titleCls}>{competency.title}</p>
                  <div className="mt-2">
                    <DualScoreProgress
                      leadScore={blind.leadScore}
                      selfScore={blind.selfScore}
                      showDual={blind.showDual}
                      theme={theme}
                    />
                  </div>
                  <CompetencyLevelIndicators competency={competency} theme={theme} />
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-4 text-sm sm:justify-end">
                  <div className="text-right">
                    <p className={`text-xs ${metaLabel}`}>Ожидается</p>
                    <p className={metaValue}>{formatScore(expected)}</p>
                  </div>
                  <GapBadgePill label={badge.label} variant={badge.variant} theme={theme} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
