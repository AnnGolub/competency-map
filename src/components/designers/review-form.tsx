"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { saveReview, type ReviewEntry } from "@/app/actions/review";
import {
  BLOCK_LABELS,
  blocksForDesignerRole,
  formatScore,
  getExpectedScore,
  groupByBlock,
  SCORE_OPTIONS,
  showPreLeadColumn,
  type Competency,
  type CompetencyItem,
  type Designer,
  type Score,
} from "@/lib/competency-utils";

type FormState = Record<
  string,
  { score: number; comment: string }
>;

function buildInitialState(
  competencies: Competency[],
  scoresByCompetency: Map<string, Score>
): FormState {
  const state: FormState = {};
  for (const c of competencies) {
    const existing = scoresByCompetency.get(c.id);
    state[c.id] = {
      score:
        existing?.score !== null && existing?.score !== undefined
          ? Number(existing.score)
          : 2,
      comment: existing?.comment ?? "",
    };
  }
  return state;
}

export function ReviewForm({
  designer,
  competencies,
  itemsByCompetency,
  scoresByCompetency,
}: {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: Map<string, CompetencyItem[]>;
  scoresByCompetency: Map<string, Score>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(competencies, scoresByCompetency)
  );

  const grouped = groupByBlock(competencies);
  const visibleBlocks = blocksForDesignerRole(designer.role);
  const preLead = showPreLeadColumn(designer.role);

  function updateCompetency(
    id: string,
    patch: Partial<{ score: number; comment: string }>
  ) {
    setForm((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries: ReviewEntry[] = competencies.map((c) => ({
      competencyId: c.id,
      score: form[c.id].score,
      comment: form[c.id].comment,
    }));

    startTransition(async () => {
      const result = await saveReview(designer.id, entries);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {visibleBlocks.map((block) => {
        const list = grouped[block];
        if (list.length === 0) return null;

        return (
          <section key={block}>
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
              {BLOCK_LABELS[block]}
            </h2>
            <ul className="mt-4 space-y-8">
              {list.map((competency) => {
                const items = itemsByCompetency.get(competency.id) ?? [];
                const value = form[competency.id];

                return (
                  <li
                    key={competency.id}
                    className="rounded-lg border-[0.5px] border-neutral-200 p-4"
                  >
                    <h3 className="font-medium">{competency.title}</h3>
                    {competency.description ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        {competency.description}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className="text-neutral-400">Ожидается </span>
                        <span className="tabular-nums font-medium">
                          {formatScore(
                            getExpectedScore(competency, designer.role)
                          )}
                        </span>
                      </div>
                      {preLead ? (
                        <div>
                          <span className="text-neutral-400">
                            Готовится к лиду{" "}
                          </span>
                          <span className="tabular-nums font-medium">
                            {formatScore(competency.expected_pre_lead)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <CompetencyLevelIndicators competency={competency} />

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-4">
                        <label
                          htmlFor={`score-${competency.id}`}
                          className="text-sm text-neutral-600"
                        >
                          Оценка
                        </label>
                        <span className="text-lg font-medium tabular-nums">
                          {value.score.toFixed(1)}
                        </span>
                      </div>
                      <input
                        id={`score-${competency.id}`}
                        type="range"
                        min={1}
                        max={4}
                        step={0.5}
                        value={value.score}
                        onChange={(e) =>
                          updateCompetency(competency.id, {
                            score: parseFloat(e.target.value),
                          })
                        }
                        className="mt-2 w-full accent-neutral-900"
                        list={`ticks-${competency.id}`}
                      />
                      <datalist id={`ticks-${competency.id}`}>
                        {SCORE_OPTIONS.map((v) => (
                          <option key={v} value={v} />
                        ))}
                      </datalist>
                      <div className="mt-1 flex justify-between text-xs text-neutral-400">
                        {SCORE_OPTIONS.map((v) => (
                          <span key={v}>{v.toFixed(1)}</span>
                        ))}
                      </div>
                    </div>

                    {items.length > 0 ? (
                      <ul className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="flex gap-2 text-sm text-neutral-600"
                          >
                            <span className="text-neutral-300">—</span>
                            <span>{item.text}</span>
                            {item.only_lead ? (
                              <span className="shrink-0 text-xs text-neutral-400">
                                (lead)
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <label className="mt-4 block">
                      <span className="text-sm text-neutral-600">
                        Комментарий
                      </span>
                      <textarea
                        value={value.comment}
                        onChange={(e) =>
                          updateCompetency(competency.id, {
                            comment: e.target.value,
                          })
                        }
                        rows={2}
                        className="mt-1 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                        placeholder="Комментарий лида…"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isPending ? "Сохранение…" : "Сохранить ревью"}
      </button>
    </form>
  );
}
