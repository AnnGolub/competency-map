import { SCORE_OPTIONS } from "@/lib/competency-utils";

export function ItemScoreSlider({
  id,
  label,
  value,
  onChange,
  expected,
  theme = "light",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  expected?: number | null;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const shell = isDark
    ? "mt-3 rounded-lg border border-app-border bg-app-canvas p-3"
    : "mt-3 rounded-lg border-[0.5px] border-neutral-100 bg-neutral-50/50 p-3";
  const labelCls = isDark ? "text-sm text-white/90" : "text-sm text-neutral-700";
  const expectedCls = isDark ? "text-xs text-app-muted" : "text-xs text-neutral-400";
  const valueCls = isDark
    ? "text-lg font-medium tabular-nums text-white"
    : "text-lg font-medium tabular-nums";
  const tickCls = isDark ? "text-xs text-app-muted" : "text-xs text-neutral-400";
  const accent = isDark ? "accent-app-accent" : "accent-neutral-900";

  return (
    <div className={shell}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className={labelCls}>{label}</p>
        {expected !== null && expected !== undefined ? (
          <span className={expectedCls}>ожидается {expected.toFixed(1)}</span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-end gap-4">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <span className={valueCls}>{value.toFixed(1)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={4}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`mt-2 w-full ${accent}`}
        list={`ticks-${id}`}
      />
      <datalist id={`ticks-${id}`}>
        {SCORE_OPTIONS.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      <div className={`mt-1 flex justify-between ${tickCls}`}>
        {SCORE_OPTIONS.map((v) => (
          <span key={v}>{v.toFixed(1)}</span>
        ))}
      </div>
    </div>
  );
}
