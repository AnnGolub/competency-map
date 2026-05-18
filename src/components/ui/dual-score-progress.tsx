import { MAX_SCORE, progressPercent } from "@/lib/competency-utils";

export function DualScoreProgress({
  leadScore,
  selfScore,
  showDual,
  theme = "light",
}: {
  leadScore: number | null;
  selfScore: number | null;
  showDual: boolean;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const labelCls = isDark ? "text-app-muted" : "text-neutral-400";
  const trackCls = isDark
    ? "border-app-border bg-app-canvas"
    : "border-neutral-200 bg-neutral-50";
  const leadBarCls = isDark ? "bg-white" : "bg-neutral-900";
  const selfBarCls = isDark ? "bg-app-muted" : "bg-neutral-400";
  const valueCls = isDark ? "text-app-muted" : "text-neutral-500";

  if (showDual && leadScore !== null && selfScore !== null) {
    return (
      <div className="space-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`w-14 shrink-0 text-xs ${labelCls}`}>Лид</span>
          <div className={`h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border ${trackCls}`}>
            <div className={`h-full rounded-full ${leadBarCls}`} style={{ width: `${progressPercent(leadScore)}%` }} />
          </div>
          <span className={`w-8 shrink-0 text-right text-xs tabular-nums ${valueCls}`}>{leadScore.toFixed(1)}</span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className={`w-14 shrink-0 text-xs ${labelCls}`}>Самооценка</span>
          <div className={`h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border ${trackCls}`}>
            <div className={`h-full rounded-full ${selfBarCls}`} style={{ width: `${progressPercent(selfScore)}%` }} />
          </div>
          <span className={`w-8 shrink-0 text-right text-xs tabular-nums ${valueCls}`}>{selfScore.toFixed(1)}</span>
        </div>
      </div>
    );
  }

  const single = leadScore ?? selfScore;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border ${trackCls}`}>
        <div className={`h-full rounded-full ${leadBarCls} transition-[width]`} style={{ width: `${progressPercent(single)}%` }} />
      </div>
      <span className={`w-8 shrink-0 text-right text-xs tabular-nums ${valueCls}`}>
        {single !== null ? single.toFixed(1) : "—"}/{MAX_SCORE.toFixed(1)}
      </span>
    </div>
  );
}
