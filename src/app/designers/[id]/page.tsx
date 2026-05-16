export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CompetencyBlockSection } from "@/components/designers/competency-block";
import { PageShell } from "@/components/ui/page-shell";
import { EditDesignerPanel } from "@/components/designers/edit-designer-panel";
import {
  averageScore,
  BLOCK_LABELS,
  blocksForDesignerRole,
  computeHalfYearGrowth,
  countBelowExpected,
  filterCompetenciesForRole,
  formatScore,
  groupByBlock,
  ROLE_LABELS,
} from "@/lib/competency-utils";
import {
  fetchCompetencies,
  fetchDesigner,
  fetchScoresForDesigner,
} from "@/lib/data/queries";

function formatReviewDate(iso: string | null): string {
  if (!iso) return "Ревью ещё не проводилось";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function DesignerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [designer, competencies, scores] = await Promise.all([
    fetchDesigner(params.id),
    fetchCompetencies(),
    fetchScoresForDesigner(params.id),
  ]);

  if (!designer) notFound();

  const visibleCompetencies = filterCompetenciesForRole(
    competencies,
    designer.role
  );
  const visibleIds = new Set(visibleCompetencies.map((c) => c.id));

  const scoresByCompetency = new Map(
    scores
      .filter((s) => visibleIds.has(s.competency_id))
      .map((s) => [s.competency_id, Number(s.score)])
  );
  const scoreValues = Array.from(scoresByCompetency.values());
  const avg = averageScore(scoreValues);
  const belowCount = countBelowExpected(
    visibleCompetencies,
    scoresByCompetency,
    designer.role
  );
  const growth = computeHalfYearGrowth(scores);

  const lastReviewAt =
    scores.length > 0
      ? scores.reduce((latest, s) =>
          new Date(s.reviewed_at) > new Date(latest) ? s.reviewed_at : latest
        , scores[0].reviewed_at)
      : null;

  const grouped = groupByBlock(visibleCompetencies);
  const visibleBlocks = blocksForDesignerRole(designer.role);

  return (
    <PageShell
      backHref="/designers"
      backLabel="Дизайнеры"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href={`/designers/${designer.id}/review`}
            className="rounded-full border border-neutral-900 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-900 hover:text-white"
          >
            Ревью
          </Link>
        </div>
      }
    >
      <header>
        <h1 className="text-2xl font-medium tracking-tight">{designer.name}</h1>
        <p className="mt-1 text-neutral-500">
          {ROLE_LABELS[designer.role]} · {designer.direction}
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          Последнее ревью: {formatReviewDate(lastReviewAt)}
        </p>
      </header>

      <EditDesignerPanel designer={designer} />

      <dl className="mt-8 grid grid-cols-3 gap-4 rounded-lg border-[0.5px] border-neutral-200 p-4">
        <div>
          <dt className="text-xs text-neutral-400">Средний балл</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums">
            {formatScore(avg)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400">Ниже ожидаемого</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums">{belowCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400">Рост за 6 мес.</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums">
            {growth === null
              ? "—"
              : `${growth > 0 ? "+" : ""}${growth.toFixed(1)}`}
          </dd>
        </div>
      </dl>

      {visibleBlocks.map((block) => (
        <CompetencyBlockSection
          key={block}
          title={BLOCK_LABELS[block]}
          competencies={grouped[block]}
          role={designer.role}
          scoresByCompetency={scoresByCompetency}
        />
      ))}
    </PageShell>
  );
}
