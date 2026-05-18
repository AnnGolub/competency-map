"use client";

import { useState, useTransition } from "react";
import {
  submitSelfReviewByToken,
  type SelfReviewEntry,
} from "@/app/actions/self-review-token";
import { SCORE_OPTIONS } from "@/lib/competency-utils";
import type { PublicSelfReviewData } from "@/lib/data/self-review-tokens";

type FormState = Record<string, number>;

function buildInitialState(
  competencies: PublicSelfReviewData["competencies"],
  initialScores: Record<string, number>
): FormState {
  const state: FormState = {};
  for (const c of competencies) {
    state[c.id] = initialScores[c.id] ?? 2;
  }
  return state;
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
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(data.competencies, data.initialScores)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries: SelfReviewEntry[] = data.competencies.map((c) => ({
      competencyId: c.id,
      selfScore: form[c.id],
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <p className="text-sm text-neutral-500">
        Оцените себя по каждой компетенции от 1.0 до 4.0.
      </p>

      <ul className="space-y-6">
        {data.competencies.map((competency) => {
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

              <div className="mt-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor={`self-${competency.id}`}
                    className="text-sm text-neutral-600"
                  >
                    Самооценка
                  </label>
                  <span className="text-lg font-medium tabular-nums">
                    {value.toFixed(1)}
                  </span>
                </div>
                <input
                  id={`self-${competency.id}`}
                  type="range"
                  min={1}
                  max={4}
                  step={0.5}
                  value={value}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [competency.id]: parseFloat(e.target.value),
                    }))
                  }
                  className="mt-2 w-full accent-neutral-900"
                />
                <div className="mt-1 flex justify-between text-xs text-neutral-400">
                  {SCORE_OPTIONS.map((v) => (
                    <span key={v}>{v.toFixed(1)}</span>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isPending ? "Отправка…" : "Отправить самооценку"}
      </button>
    </form>
  );
}
