export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CompetencyBlockSection } from "@/components/designers/competency-block";
import { EditDesignerPanel } from "@/components/designers/edit-designer-panel";
import { GenerateSelfReviewLink } from "@/components/designers/generate-self-review-link";
import { PageShell } from "@/components/ui/page-shell";
import {
  averageScore,
  BLOCK_LABELS,
  blocksForDesignerRole,
  collectVisibleItems,
  computeHalfYearGrowth,
  countBelowExpected,
  filterCompetenciesForRole,
  formatScore,
  groupByBlock,
  groupItemsByCompetency,
  primaryVisibleScore,
  resolveBlindScoresFromItems,
  ROLE_LABELS,
} from "@/lib/competency-utils";
import {
  fetchCompetencies,
  fetchCompetencyItems,
  fetchDesigner,
  fetchItemScoresForDesigner,
} from "@/lib/data/queries";
import { hasCompletedSelfReview } from "@/lib/data/self-review-tokens";
import { canAccessDesignerProfile, getSessionContext } from "@/lib/session";

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
  const session = await getSessionContext();
  if (!session) redirect("/login");

  if (!canAccessDesignerProfile(session)) {
    notFound();
  }

  const [designer, competencies, items, itemScores, selfReviewCompleted] =
    await Promise.all([
      fetchDesigner(params.id),
      fetchCompetencies(),
      fetchCompetencyItems(),
      fetchItemScoresForDesigner(params.id),
      hasCompletedSelfReview(params.id),
    ]);

  if (!designer) notFound();

  const visibleCompetencies = filterCompetenciesForRole(
    competencies,
    designer.role
  );
  const itemsByCompetency = groupItemsByCompetency(items, designer.role);
  const visibleItems = collectVisibleItems(
    visibleCompetencies,
    itemsByCompetency
  );

  const scoresByItem = new Map(
    itemScores.map((s) => [s.competency_item_id, s])
  );

  const primaryScores = new Map<string, number>();
  for (const c of visibleCompetencies) {
    const competencyItems = itemsByCompetency.get(c.id) ?? [];
    const blind = resolveBlindScoresFromItems(
      competencyItems,
      scoresByItem,
      selfReviewCompleted
    );
    const primary = primaryVisibleScore(blind);
    if (primary !== null) primaryScores.set(c.id, primary);
  }

  const leadItemScores = visibleItems
    .map((item) => scoresByItem.get(item.id)?.score)
    .filter((s): s is number => s !== null && s !== undefined)
    .map(Number);

  const avg = averageScore(leadItemScores);
  const belowCount = countBelowExpected(
    visibleCompetencies,
    primaryScores,
    designer.role
  );
  const growth = computeHalfYearGrowth(itemScores);

  const lastReviewAt = itemScores.reduce<string | null>((latest, s) => {
    if (!s.reviewed_at) return latest;
    if (!latest) return s.reviewed_at;
    return new Date(s.reviewed_at) > new Date(latest) ? s.reviewed_at : latest;
  }, null);

  const grouped = groupByBlock(visibleCompetencies);
  const visibleBlocks = blocksForDesignerRole(designer.role);

  return (
    <PageShell
      backHref="/designers"
      backLabel="Дизайнеры"
      actions={
        <Link
          href={`/designers/${designer.id}/review`}
          className="rounded-full border border-neutral-900 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-900 hover:text-white"
        >
          Ревью
        </Link>
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
      <GenerateSelfReviewLink designerId={designer.id} />

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
          itemsByCompetency={itemsByCompetency}
          scoresByItem={scoresByItem}
          selfReviewCompleted={selfReviewCompleted}
          isAdmin
        />
      ))}
    </PageShell>
  );
}
