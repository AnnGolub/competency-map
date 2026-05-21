import Link from "next/link";
import { IconSelectArrow } from "@/components/designers/designers-icons";
import { ROLE_LABELS, type Designer } from "@/lib/competency-utils";

export function ReviewPageHeader({ designer }: { designer: Designer }) {
  return (
    <section className="flex max-w-[818px] flex-col gap-4">
      <Link
        href={`/designers/${designer.id}`}
        className="inline-flex h-5 w-fit items-center gap-1 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white"
      >
        <IconSelectArrow className="rotate-90 text-current" />
        К профилю
      </Link>

      <h1 className="text-[30px] font-bold leading-9 text-white">
        Ревью – {designer.name}
      </h1>

      <p className="text-base leading-6 text-white">
        {ROLE_LABELS[designer.role]} • {designer.direction}
      </p>
    </section>
  );
}
