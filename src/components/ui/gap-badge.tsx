import type { GapBadge } from "@/lib/competency-utils";

const STYLES: Record<GapBadge, string> = {
  ok: "border-neutral-300 text-neutral-600",
  "gap-0.5": "border-amber-300 text-amber-800",
  "gap-1.0": "border-red-300 text-red-800",
};

export function GapBadgePill({
  label,
  variant,
}: {
  label: string;
  variant: GapBadge;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs ${STYLES[variant]}`}
    >
      {label}
    </span>
  );
}
