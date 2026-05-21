export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import { DesignersTopBar } from "@/components/designers/designers-top-bar";
import { ReviewForm } from "@/components/designers/review-form";
import { ReviewPageHeader } from "@/components/designers/review-page-header";
import { fetchDesignersWithAverages, fetchReviewPageData } from "@/lib/data/queries";
import { getSessionContext } from "@/lib/session";

export default async function DesignerReviewPage({
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
        <ReviewPageHeader designer={designer} />

        <div className="mt-10">
          <ReviewForm
            designer={designer}
            competencies={competencies}
            itemsByCompetency={itemsByCompetency}
            scoresByItem={scoresByItem}
          />
        </div>
      </main>
    </DesignersAppShell>
  );
}
