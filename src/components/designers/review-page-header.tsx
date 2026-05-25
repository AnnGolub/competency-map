import { DesignerBackLink } from "@/components/designers/designer-back-link";
import { ROLE_LABELS, type Designer } from "@/lib/competency-utils";

export function ReviewPageHeader({
  designer,
  title = "Ревью",
}: {
  designer: Designer;
  title?: string;
}) {
  return (
    <section className="flex max-w-[818px] flex-col gap-4">
      <DesignerBackLink href={`/designers/${designer.id}`}>К профилю</DesignerBackLink>

      <h1 className="text-[30px] font-bold leading-9 text-white">
        {title} – {designer.name}
      </h1>

      <p className="text-base leading-6 text-white">
        {ROLE_LABELS[designer.role]} • {designer.direction}
      </p>
    </section>
  );
}
