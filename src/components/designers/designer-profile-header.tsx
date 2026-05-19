"use client";

import Link from "next/link";
import { GenerateSelfReviewLink } from "@/components/designers/generate-self-review-link";
import { IconSelectArrow } from "@/components/designers/designers-icons";
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
}: {
  designer: Designer;
  lastReviewAt: string | null;
}) {
  return (
    <section className="flex max-w-[818px] flex-col gap-4">
      <Link
        href="/designers"
        className="inline-flex h-8 w-fit items-center gap-1 rounded-lg bg-app-input px-4 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white"
      >
        <IconSelectArrow className="rotate-90 text-current" />
        К списку дизайнеров
      </Link>

      <h1 className="text-[30px] font-bold leading-9 text-white">{designer.name}</h1>

      <p className="text-base leading-6 text-white">
        {ROLE_LABELS[designer.role]} • {designer.direction}
      </p>

      <p className="text-base leading-6 text-white">
        {formatReviewDate(lastReviewAt)}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/designers/${designer.id}/review`}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-app-accent px-5 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover"
        >
          Провести ревью
        </Link>

        <GenerateSelfReviewLink designerId={designer.id} variant="profile" />
      </div>
    </section>
  );
}
