export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { FinalReviewPageClient } from "@/components/designers/final-review-page-client";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import {
  fetchDesignersWithAverages,
  fetchReviewPageData,
} from "@/lib/data/queries";
import { getSessionContext } from "@/lib/session";

export default async function DesignerFinalReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.isAdmin) {
    redirect("/no-access");
  }

  const [data, designersExport] = await Promise.all([
    fetchReviewPageData(params.id),
    fetchDesignersWithAverages(),
  ]);
  if (!data) notFound();

  const { designer, competencies, itemsByCompetency, scoresByItem } = data;

  return (
    <DesignersAppShell>
      <FinalReviewPageClient
        designer={designer}
        competencies={competencies}
        itemsByCompetency={itemsByCompetency}
        scoresByItem={scoresByItem}
        exportDesigners={designersExport.designers}
        competencyExportColumns={designersExport.competencyExportColumns}
      />
    </DesignersAppShell>
  );
}
