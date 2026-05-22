export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { DesignerMetricCards } from "@/components/designers/designer-metric-cards";
import { DesignerProfileHeader } from "@/components/designers/designer-profile-header";
import { DesignerProfileResults } from "@/components/designers/designer-profile-results";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import { DesignersTopBar } from "@/components/designers/designers-top-bar";
import {
  collectVisibleItems,
  computeHalfYearGrowth,
  countBelowExpected,
  filterCompetenciesForRole,
  groupItemsByCompetency,
  primaryVisibleScore,
  resolveBlindScoresFromItems,
  averageScore,
} from "@/lib/competency-utils";
import {
  fetchCompetencies,
  fetchCompetencyItemsForCompetencies,
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

  const designer = await fetchDesigner(params.id);
  if (!designer) notFound();

  const allCompetencies = await fetchCompetencies();
  const visibleCompetencies = filterCompetenciesForRole(
    allCompetencies,
    designer.role
  );
  const competencyIds = visibleCompetencies.map((c) => c.id);

  const [items, itemScores, selfReviewCompleted, designersExport] =
    await Promise.all([
      fetchCompetencyItemsForCompetencies(competencyIds),
      fetchItemScoresForDesigner(params.id),
      hasCompletedSelfReview(params.id),
      fetchDesignersWithAverages(),
    ]);

  const itemsByCompetencyMap = groupItemsByCompetency(items, designer.role, {
    includeOnlyLead: true,
  });
  const itemsByCompetency = Object.fromEntries(itemsByCompetencyMap);
  const scoresByItem = Object.fromEntries(
    itemScores.map((s) => [s.competency_item_id, s])
  );

  const visibleItems = collectVisibleItems(
    visibleCompetencies,
    itemsByCompetencyMap
  );

  const scoresByItemMap = new Map(
    itemScores.map((s) => [s.competency_item_id, s])
  );

  const primaryScores = new Map<string, number>();
  for (const c of visibleCompetencies) {
    const competencyItems = itemsByCompetencyMap.get(c.id) ?? [];
    const blind = resolveBlindScoresFromItems(
      competencyItems,
      scoresByItemMap,
      selfReviewCompleted
    );
    const primary = primaryVisibleScore(blind);
    if (primary !== null) primaryScores.set(c.id, primary);
  }

  const leadItemScores = visibleItems
    .map((item) => scoresByItemMap.get(item.id)?.score)
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

        <DesignerProfileResults
          designer={designer}
          competencies={visibleCompetencies}
          itemsByCompetency={itemsByCompetency}
          scoresByItem={scoresByItem}
        />
      </main>
    </DesignersAppShell>
  );
}
