import { MAX_SCORE, progressPercent } from "@/lib/competency-utils";

export function ProgressBar({ score }: { score: number | null }) {
  const pct = progressPercent(score);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
        <div
          className="h-full rounded-full bg-neutral-900 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-neutral-500">
        {score !== null ? score.toFixed(1) : "—"}/{MAX_SCORE.toFixed(1)}
      </span>
    </div>
  );
}
