"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CompetencyLevelIndicators } from "@/components/designers/competency-level-indicators";
import { saveReview, type ReviewEntry } from "@/app/actions/review";
import { ItemScoreSlider } from "@/components/ui/item-score-slider";
import type {
  ItemsByCompetencyRecord,
  ScoresByItemRecord,
} from "@/lib/data/queries";
import {
  BLOCK_LABELS,
  blocksForDesignerRole,
  formatScore,
  getExpectedScore,
  getExpectedScoreForItem,
  groupByBlock,
  showPreLeadColumn,
  type Competency,
  type CompetencyItem,
  type Designer,
} from "@/lib/competency-utils";

type FormState = Record<string, number>;

function buildInitialState(
  itemsByCompetency: ItemsByCompetencyRecord,
  scoresByItem: ScoresByItemRecord
): FormState {
  const state: FormState = {};
  for (const items of Object.values(itemsByCompetency)) {
    for (const item of items) {
      const existing = scoresByItem[item.id];
      state[item.id] =
        existing?.score !== null && existing?.score !== undefined
          ? Number(existing.score)
          : 2;
    }
  }
  return state;
}

function collectAllItems(
  competencies: Competency[],
  itemsByCompetency: ItemsByCompetencyRecord
): CompetencyItem[] {
  const result: CompetencyItem[] = [];
  for (const c of competencies) {
    result.push(...(itemsByCompetency[c.id] ?? []));
  }
  return result;
}

export function ReviewForm({
  designer,
  competencies,
  itemsByCompetency,
  scoresByItem,
  theme = "dark",
}: {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: ItemsByCompetencyRecord;
  scoresByItem: ScoresByItemRecord;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(itemsByCompetency, scoresByItem)
  );

  const grouped = groupByBlock(competencies);
  const visibleBlocks = blocksForDesignerRole(designer.role);
  const preLead = showPreLeadColumn(designer.role);
  const allItems = collectAllItems(competencies, itemsByCompetency);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries: ReviewEntry[] = allItems.map((item) => ({
      competencyItemId: item.id,
      score: form[item.id],
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
        <p
          className={
            isDark
              ? "rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          }
        >
          {error}
        </p>
      ) : null}

      {visibleBlocks.map((block) => {
        const list = grouped[block];
        if (list.length === 0) return null;

        return (
          <section key={block}>
            <h2
              className={
                isDark
                  ? "text-sm font-medium uppercase tracking-wide text-app-muted"
                  : "text-sm font-medium uppercase tracking-wide text-neutral-400"
              }
            >
              {BLOCK_LABELS[block]}
            </h2>
            <ul className="mt-4 space-y-8">
              {list.map((competency) => {
                const items = itemsByCompetency[competency.id] ?? [];

                return (
                  <li
                    key={competency.id}
                    className={
                      isDark
                        ? "rounded-xl border border-app-border bg-app-surface p-5"
                        : "rounded-lg border-[0.5px] border-neutral-200 p-4"
                    }
                  >
                    <h3 className={isDark ? "font-medium text-white" : "font-medium"}>
                      {competency.title}
                    </h3>
                    {competency.description ? (
                      <p
                        className={
                          isDark
                            ? "mt-1 text-sm text-app-muted"
                            : "mt-1 text-sm text-neutral-500"
                        }
                      >
                        {competency.description}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className={isDark ? "text-app-muted" : "text-neutral-400"}>
                          Ожидается{" "}
                        </span>
                        <span
                          className={
                            isDark
                              ? "tabular-nums font-medium text-white"
                              : "tabular-nums font-medium"
                          }
                        >
                          {formatScore(
                            getExpectedScore(competency, designer.role)
                          )}
                        </span>
                      </div>
                      {preLead ? (
                        <div>
                          <span className={isDark ? "text-app-muted" : "text-neutral-400"}>
                            Готовится к лиду{" "}
                          </span>
                          <span
                            className={
                              isDark
                                ? "tabular-nums font-medium text-white"
                                : "tabular-nums font-medium"
                            }
                          >
                            {formatScore(competency.expected_pre_lead)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <CompetencyLevelIndicators competency={competency} theme={theme} />

                    {items.length > 0 ? (
                      <ul className="mt-4 space-y-1">
                        {items.map((item) => (
                          <li key={item.id}>
                            <ItemScoreSlider
                              id={`review-${item.id}`}
                              label={item.text}
                              value={form[item.id]}
                              expected={getExpectedScoreForItem(
                                item,
                                designer.role
                              )}
                              theme={theme}
                              onChange={(score) =>
                                setForm((prev) => ({
                                  ...prev,
                                  [item.id]: score,
                                }))
                              }
                            />
                            {item.only_lead ? (
                              <span
                                className={
                                  isDark
                                    ? "mt-1 block text-xs text-app-muted"
                                    : "mt-1 block text-xs text-neutral-400"
                                }
                              >
                                (lead)
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className={
                          isDark
                            ? "mt-4 text-sm text-app-muted"
                            : "mt-4 text-sm text-neutral-400"
                        }
                      >
                        Нет подпунктов для оценки
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <button
        type="submit"
        disabled={isPending || allItems.length === 0}
        className={
          isDark
            ? "w-full rounded-lg bg-app-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
            : "w-full rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        }
      >
        {isPending ? "Сохранение…" : "Сохранить ревью"}
      </button>
    </form>
  );
}
