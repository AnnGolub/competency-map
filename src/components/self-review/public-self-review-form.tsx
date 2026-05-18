"use client";

import { useState, useTransition } from "react";
import {
  submitSelfReviewByToken,
  type SelfReviewEntry,
} from "@/app/actions/self-review-token";
import { ItemScoreSlider } from "@/components/ui/item-score-slider";
import {
  BLOCK_LABELS,
  blocksForDesignerRole,
  groupByBlock,
  type Competency,
} from "@/lib/competency-utils";
import type {
  PublicSelfReviewCompetency,
  PublicSelfReviewData,
} from "@/lib/data/self-review-tokens";

type FormState = Record<string, number>;

function buildInitialState(data: PublicSelfReviewData): FormState {
  const state: FormState = {};
  for (const c of data.competencies) {
    for (const item of c.items) {
      state[item.id] = data.initialScores[item.id] ?? 2;
    }
  }
  return state;
}

function toCompetencyRows(
  competencies: PublicSelfReviewCompetency[]
): Competency[] {
  return competencies.map((c) => ({
    id: c.id,
    block: c.block,
    title: c.title,
    description: c.description,
    expected_junior: 0,
    expected_middle: 0,
    expected_senior: 0,
    expected_lead: 0,
    expected_pre_lead: 0,
    indicators_1: null,
    indicators_2: null,
    indicators_3: null,
    indicators_4: null,
  }));
}

export function PublicSelfReviewForm({
  token,
  data,
}: {
  token: string;
  data: PublicSelfReviewData;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(() => buildInitialState(data));

  const grouped = groupByBlock(toCompetencyRows(data.competencies));
  const visibleBlocks = blocksForDesignerRole(data.role);
  const allItems = data.competencies.flatMap((c) => c.items);
  const competenciesById = new Map(data.competencies.map((c) => [c.id, c]));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries: SelfReviewEntry[] = allItems.map((item) => ({
      competencyItemId: item.id,
      selfScore: form[item.id],
    }));

    startTransition(async () => {
      const result = await submitSelfReviewByToken(token, entries);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="rounded-lg border-[0.5px] border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="font-medium">Спасибо!</p>
        <p className="mt-2 text-sm text-neutral-600">
          Самооценка отправлена. Повторно заполнить форму по этой ссылке нельзя.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <p className="text-sm text-neutral-500">
        Оцените себя по каждому подпункту от 1.0 до 4.0.
      </p>

      {visibleBlocks.map((block) => {
        const list = grouped[block];
        if (list.length === 0) return null;

        return (
          <section key={block}>
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
              {BLOCK_LABELS[block]}
            </h2>
            <ul className="mt-4 space-y-6">
              {list.map((competency) => {
                const c = competenciesById.get(competency.id);
                if (!c) return null;

                return (
                  <li
                    key={c.id}
                    className="rounded-lg border-[0.5px] border-neutral-200 p-4"
                  >
                    <h3 className="font-medium">{c.title}</h3>
                    {c.description ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        {c.description}
                      </p>
                    ) : null}

                    <ul className="mt-4 space-y-1">
                      {c.items.map((item) => (
                        <li key={item.id}>
                          <ItemScoreSlider
                            id={`self-${item.id}`}
                            label={item.text}
                            value={form[item.id]}
                            expected={item.expected}
                            onChange={(selfScore) =>
                              setForm((prev) => ({
                                ...prev,
                                [item.id]: selfScore,
                              }))
                            }
                          />
                        </li>
                      ))}
                    </ul>
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
        className="w-full rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isPending ? "Отправка…" : "Отправить самооценку"}
      </button>
    </form>
  );
}
