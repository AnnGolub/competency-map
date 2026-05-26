"use client";

import Link from "next/link";
import { DesignerBackLink } from "@/components/designers/designer-back-link";
import { GenerateQuestionnaireLink } from "@/components/designers/generate-questionnaire-link";
import { GenerateSelfReviewLink } from "@/components/designers/generate-self-review-link";
import { ROLE_LABELS, type Designer } from "@/lib/competency-utils";

function formatReviewDate(iso: string | null): string {
  if (!iso) return "Последнее ревью: еще не проводилось";
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
  return `Последнее ревью: ${formatted}`;
}

export function DesignerProfileHeader({
  designer,
  lastReviewAt,
  hasFinalReview,
}: {
  designer: Designer;
  lastReviewAt: string | null;
  hasFinalReview: boolean;
}) {
  const reviewHref = hasFinalReview
    ? `/designers/${designer.id}/review`
    : `/designers/${designer.id}/final-review`;
  const reviewLabel = hasFinalReview ? "Провести ревью" : "Завершить ревью";

  return (
    <section className="flex max-w-[818px] flex-col gap-4">
      <DesignerBackLink href="/designers">К списку дизайнеров</DesignerBackLink>

      <h1 className="text-[30px] font-bold leading-9 text-white">{designer.name}</h1>

      <p className="text-base leading-6 text-white">
        {ROLE_LABELS[designer.role]} • {designer.direction}
      </p>

      <p className="text-base leading-6 text-white">
        {formatReviewDate(lastReviewAt)}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={reviewHref}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-app-accent px-5 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover"
        >
          {reviewLabel}
        </Link>

        <GenerateSelfReviewLink designerId={designer.id} variant="profile" />
        <GenerateQuestionnaireLink designerId={designer.id} />
      </div>
    </section>
  );
}
