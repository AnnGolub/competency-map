export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { DesignerProfilePageClient } from "@/components/designers/designer-profile-page-client";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
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

  const [items, itemScores, selfReviewCompleted, designersExport] = await Promise.all([
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
  const reviewItemIds = new Set(visibleItems.map((item) => item.id));
  const selfReviewItemIds = new Set(
    items
      .filter((item) => designer.role === "lead" || !item.only_lead)
      .map((item) => item.id)
  );

  function resolvedPrimaryScore(itemId: string): number | null {
    const row = scoresByItemMap.get(itemId);
    if (!row) return null;
    if (row.final_score !== null && row.final_score !== undefined) {
      return Number(row.final_score);
    }
    if (row.score !== null && row.score !== undefined) {
      return Number(row.score);
    }
    return null;
  }

  const primaryScores = new Map<string, number>();
  for (const c of visibleCompetencies) {
    const competencyItems = itemsByCompetencyMap.get(c.id) ?? [];
    const finalValues = competencyItems
      .map((item) => resolvedPrimaryScore(item.id))
      .filter((score): score is number => score !== null);
    const blind = resolveBlindScoresFromItems(
      competencyItems,
      scoresByItemMap,
      selfReviewCompleted
    );
    const primary =
      finalValues.length > 0 ? averageScore(finalValues) : primaryVisibleScore(blind);
    if (primary !== null) primaryScores.set(c.id, primary);
  }

  const leadItemScores = visibleItems
    .map((item) => resolvedPrimaryScore(item.id))
    .filter((s): s is number => s !== null && s !== undefined);

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

  const hasLeadReview =
    reviewItemIds.size > 0 &&
    Array.from(reviewItemIds).every((itemId) => {
      const row = scoresByItemMap.get(itemId);
      return row?.score !== null && row?.score !== undefined;
    });
  const hasSelfReview =
    selfReviewItemIds.size > 0 &&
    Array.from(selfReviewItemIds).every((itemId) => {
      const row = scoresByItemMap.get(itemId);
      return row?.self_score !== null && row?.self_score !== undefined;
    });
  const hasFinalReview =
    reviewItemIds.size > 0 &&
    Array.from(reviewItemIds).every((itemId) => {
      const row = scoresByItemMap.get(itemId);
      return row?.final_score !== null && row?.final_score !== undefined;
    });

  return (
    <DesignersAppShell>
      <DesignerProfilePageClient
        designer={designer}
        lastReviewAt={lastReviewAt}
        hasFinalReview={hasFinalReview}
        average={avg}
        belowCount={belowCount}
        growth={growth}
        maxBelow={visibleCompetencies.length}
        competencies={visibleCompetencies}
        itemsByCompetency={itemsByCompetency}
        scoresByItem={scoresByItem}
        hasLeadReview={hasLeadReview}
        hasSelfReview={hasSelfReview}
        exportDesigners={designersExport.designers}
        competencyExportColumns={designersExport.competencyExportColumns}
      />
    </DesignersAppShell>
  );
}
