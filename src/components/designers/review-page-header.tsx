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
    <section className="flex w-full flex-col gap-2 self-stretch">
      <DesignerBackLink href={`/designers/${designer.id}`}>Профиль</DesignerBackLink>

      <h1 className="font-sf text-[30px] font-bold leading-9 tracking-[0.1px] text-[rgba(3,3,6,0.88)]">
        {title} — {designer.name}
      </h1>

      <p className="font-sf text-base font-normal leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)]">
        {ROLE_LABELS[designer.role]} • {designer.direction}
      </p>
    </section>
  );
}
