export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "@/components/designers/review-form";
import { PageShell } from "@/components/ui/page-shell";
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

  const { designer, competencies, itemsByCompetency, scoresByCompetency } =
    data;

  return (
    <PageShell
      title="Ревью"
      backHref={`/designers/${designer.id}`}
      backLabel="Профиль"
    >
      <p className="mb-8 text-sm text-neutral-500">
        {designer.name} · {ROLE_LABELS[designer.role]} · {designer.direction}
      </p>
      <ReviewForm
        designer={designer}
        competencies={competencies}
        itemsByCompetency={itemsByCompetency}
        scoresByCompetency={scoresByCompetency}
      />
    </PageShell>
  );
}
