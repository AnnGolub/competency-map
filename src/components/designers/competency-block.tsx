import { GapBadgePill } from "@/components/ui/gap-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  formatScore,
  getExpectedScore,
  getGapBadge,
  type Competency,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

export function CompetencyBlockSection({
  title,
  competencies,
  role,
  scoresByCompetency,
}: {
  title: string;
  competencies: Competency[];
  role: DesignerRole;
  scoresByCompetency: Map<string, number>;
}) {
  if (competencies.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
        {title}
      </h2>
      <ul className="mt-4 divide-y divide-neutral-200 border-y-[0.5px] border-neutral-200">
        {competencies.map((competency) => {
          const current = scoresByCompetency.get(competency.id) ?? null;
          const expected = getExpectedScore(competency, role);
          const badge = getGapBadge(current, expected);

          return (
            <li
              key={competency.id}
              className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-medium">{competency.title}</p>
                <div className="mt-2">
                  <ProgressBar score={current} />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="text-xs text-neutral-400">Ожидается</p>
                  <p className="tabular-nums">{formatScore(expected)}</p>
                </div>
                <GapBadgePill label={badge.label} variant={badge.variant} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
