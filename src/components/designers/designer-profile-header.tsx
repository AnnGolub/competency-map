"use client";

import Link from "next/link";
import { GenerateDesignerLinksButton } from "@/components/designers/generate-designer-links-button";
import { ROLE_LABELS, type Designer } from "@/lib/competency-utils";

const PRIMARY_BUTTON =
  "font-sf inline-flex min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[#212124] px-5 py-1 text-base font-medium leading-6 text-[rgba(255,255,255,0.94)] transition-opacity hover:opacity-90";

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
  hasLeadReview,
  selfReviewCompleted,
  hasFinalReview,
}: {
  designer: Designer;
  lastReviewAt: string | null;
  hasLeadReview: boolean;
  selfReviewCompleted: boolean;
  hasFinalReview: boolean;
}) {
  const readyForFinalReview =
    selfReviewCompleted && hasLeadReview && !hasFinalReview;

  const reviewHref = readyForFinalReview
    ? `/designers/${designer.id}/final-review`
    : `/designers/${designer.id}/review`;
  const reviewLabel = readyForFinalReview ? "Завершить ревью" : "Провести ревью";

  return (
    <section className="flex min-w-[280px] flex-1 flex-col justify-between self-stretch rounded-[24px] bg-[#F2F3F5] p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-sf text-[30px] font-bold leading-9 tracking-[0.1px] text-[rgba(3,3,6,0.88)]">
          {designer.name}
        </h1>
        <p className="font-sf text-base font-normal leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)]">
          {ROLE_LABELS[designer.role]} • {designer.direction}
        </p>
        <p className="font-sf text-base font-normal leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)]">
          {formatReviewDate(lastReviewAt)}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href={reviewHref} className={PRIMARY_BUTTON}>
          {reviewLabel}
        </Link>
        <GenerateDesignerLinksButton designerId={designer.id} />
      </div>
    </section>
  );
}
