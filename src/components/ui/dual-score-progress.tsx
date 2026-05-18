import { MAX_SCORE, progressPercent } from "@/lib/competency-utils";

export function DualScoreProgress({
  leadScore,
  selfScore,
  showDual,
}: {
  leadScore: number | null;
  selfScore: number | null;
  showDual: boolean;
}) {
  if (showDual && leadScore !== null && selfScore !== null) {
    return (
      <div className="space-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="w-14 shrink-0 text-xs text-neutral-400">Лид</span>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
            <div
              className="h-full rounded-full bg-neutral-900"
              style={{ width: `${progressPercent(leadScore)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs tabular-nums text-neutral-500">
            {leadScore.toFixed(1)}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="w-14 shrink-0 text-xs text-neutral-400">
            Самооценка
          </span>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
            <div
              className="h-full rounded-full bg-neutral-400"
              style={{ width: `${progressPercent(selfScore)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs tabular-nums text-neutral-500">
            {selfScore.toFixed(1)}
          </span>
        </div>
      </div>
    );
  }

  const single = leadScore ?? selfScore;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
        <div
          className="h-full rounded-full bg-neutral-900 transition-[width]"
          style={{ width: `${progressPercent(single)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-neutral-500">
        {single !== null ? single.toFixed(1) : "—"}/{MAX_SCORE.toFixed(1)}
      </span>
    </div>
  );
}
