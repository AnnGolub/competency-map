export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { CompetencyBlockSection } from "@/components/designers/competency-block";
import { DesignerMetricCards } from "@/components/designers/designer-metric-cards";
import { DesignerProfileHeader } from "@/components/designers/designer-profile-header";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import { DesignersTopBar } from "@/components/designers/designers-top-bar";
import {
  BLOCK_LABELS,
  blocksForDesignerRole,
  collectVisibleItems,
  computeHalfYearGrowth,
  countBelowExpected,
  filterCompetenciesForRole,
  groupByBlock,
  groupItemsByCompetency,
  primaryVisibleScore,
  resolveBlindScoresFromItems,
  averageScore,
} from "@/lib/competency-utils";
import {
  fetchCompetencies,
  fetchCompetencyItems,
  fetchDesigner,
  fetchDesignersWithAverages,
  fetchItemScoresForDesigner,
} from "@/lib/data/queries";
import { hasCompletedSelfReview } from "@/lib/data/self-review-tokens";
import { canAccessDesignerProfile, getSessionContext } from "@/lib/session";

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

  const [
    designer,
    competencies,
    items,
    itemScores,
    selfReviewCompleted,
    designersExport,
  ] = await Promise.all([
    fetchDesigner(params.id),
    fetchCompetencies(),
    fetchCompetencyItems(),
    fetchItemScoresForDesigner(params.id),
    hasCompletedSelfReview(params.id),
    fetchDesignersWithAverages(),
  ]);

  if (!designer) notFound();

  const visibleCompetencies = filterCompetenciesForRole(
    competencies,
    designer.role
  );
  const itemsByCompetency = groupItemsByCompetency(items, designer.role, {
    includeOnlyLead: true,
  });
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
    <DesignersAppShell>
      <DesignersTopBar
        title="Дизайнеры"
        actions={
          <>
            <DesignersCsvExport
              designers={designersExport.designers}
              competencyColumns={designersExport.competencyExportColumns}
            />
            <DesignersLogoutButton />
          </>
        }
      />

      <main className="flex-1 px-8 pb-10 pt-8">
        <DesignerProfileHeader
          designer={designer}
          lastReviewAt={lastReviewAt}
        />

        <DesignerMetricCards
          average={avg}
          belowCount={belowCount}
          growth={growth}
          maxBelow={visibleCompetencies.length}
        />

        <div className="mt-10 max-w-[1152px] space-y-10">
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
              theme="dark"
            />
          ))}
        </div>
      </main>
    </DesignersAppShell>
  );
}
