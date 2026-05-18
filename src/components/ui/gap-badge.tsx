import type { GapBadge } from "@/lib/competency-utils";

const STYLES_LIGHT: Record<GapBadge, string> = {
  ok: "border-neutral-300 text-neutral-600",
  "gap-0.5": "border-amber-300 text-amber-800",
  "gap-1.0": "border-red-300 text-red-800",
};

const STYLES_DARK: Record<GapBadge, string> = {
  ok: "border-app-border text-app-muted",
  "gap-0.5": "border-amber-500/50 text-amber-300",
  "gap-1.0": "border-red-500/50 text-red-300",
};

export function GapBadgePill({
  label,
  variant,
  theme = "light",
}: {
  label: string;
  variant: GapBadge;
  theme?: "light" | "dark";
}) {
  const styles = theme === "dark" ? STYLES_DARK : STYLES_LIGHT;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs ${styles[variant]}`}
    >
      {label}
    </span>
  );
}
