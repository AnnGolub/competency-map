export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersPageHeader } from "@/components/designers/designers-page-header";
import { ReviewForm } from "@/components/designers/review-form";
import { ROLE_LABELS } from "@/lib/competency-utils";
import { fetchReviewPageData } from "@/lib/data/queries";
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

  const data = await fetchReviewPageData(params.id);
  if (!data) notFound();

  const { designer, competencies, itemsByCompetency, scoresByItem } = data;

  return (
    <DesignersAppShell>
      <DesignersPageHeader
        title="Ревью"
        backHref={`/designers/${designer.id}`}
        backLabel="Профиль"
        subtitle={
          <p>
            {designer.name} · {ROLE_LABELS[designer.role]} · {designer.direction}
          </p>
        }
        showLogout={false}
      />

      <main className="flex-1 px-10 pb-10 pt-6">
        <ReviewForm
          designer={designer}
          competencies={competencies}
          itemsByCompetency={itemsByCompetency}
          scoresByItem={scoresByItem}
          theme="dark"
        />
      </main>
    </DesignersAppShell>
  );
}
