export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/designers/review-form";
import { PageShell } from "@/components/ui/page-shell";
import { ROLE_LABELS } from "@/lib/competency-utils";
import { fetchReviewPageData } from "@/lib/data/queries";

export default async function DesignerReviewPage({
  params,
}: {
  params: { id: string };
}) {
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
