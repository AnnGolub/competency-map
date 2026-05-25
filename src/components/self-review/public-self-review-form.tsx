"use client";

import { useMemo, useState } from "react";
import {
  submitSelfReviewByToken,
  type SelfReviewEntry,
} from "@/app/actions/self-review-token";
import { ReviewCompetencyCard } from "@/components/designers/review-competency-card";
import { ReviewStepper } from "@/components/designers/review-stepper";
import {
  BLOCK_LABELS,
  blocksForDesignerRole,
  groupByBlock,
} from "@/lib/competency-utils";
import type { PublicSelfReviewData } from "@/lib/data/self-review-tokens";
import type { CompetencyBlock } from "@/types/database";

const REVIEW_STEP_ORDER: CompetencyBlock[] = ["hard", "soft", "leadership"];

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

export function PublicSelfReviewForm({
  token,
  data,
}: {
  token: string;
  data: PublicSelfReviewData;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(() => buildInitialState(data));

  const grouped = groupByBlock(data.competencies);
  const visibleBlocks = blocksForDesignerRole(data.role);
  const allItems = data.competencies.flatMap((c) => c.items);
  const steps = REVIEW_STEP_ORDER.filter((block) => visibleBlocks.includes(block));
  const currentBlock = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const blockCompetencies = currentBlock ? grouped[currentBlock] : [];
  const itemsByCompetency = useMemo(
    () => Object.fromEntries(data.competencies.map((c) => [c.id, c.items])),
    [data.competencies]
  );

  function handleScoreChange(itemId: string, score: number) {
    setForm((prev) => ({ ...prev, [itemId]: score }));
  }

  function handleBack() {
    setError(null);
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleContinue() {
    setError(null);
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const entries: SelfReviewEntry[] = allItems.map((item) => ({
      competencyItemId: item.id,
      selfScore: form[item.id],
    }));

    try {
      const result = await submitSelfReviewByToken(token, entries);
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-app-border bg-app-sidebar p-6 text-center text-white">
        <p className="font-medium">Спасибо!</p>
        <p className="mt-2 text-sm text-app-placeholder">
          Самооценка отправлена. Повторно заполнить форму по этой ссылке нельзя.
        </p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <p className="text-base leading-6 text-app-placeholder">
        Нет блоков компетенций для самооценки.
      </p>
    );
  }

  return (
    <div className="max-w-[1152px]">
      <ReviewStepper steps={steps} currentIndex={stepIndex} />

      {error ? (
        <p className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <section className="mt-10">
        <h2
          style={{
            fontFamily: "Avenir Next, sans-serif",
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: "26px",
            color: "#ffffff",
          }}
        >
          {currentBlock ? BLOCK_LABELS[currentBlock] : ""}
        </h2>

        <div className="mt-6 flex flex-col gap-6">
          {blockCompetencies.map((competency) => (
            <ReviewCompetencyCard
              key={competency.id}
              competency={competency}
              items={itemsByCompetency[competency.id] ?? []}
              role={data.role}
              form={form}
              onScoreChange={handleScoreChange}
            />
          ))}
        </div>
      </section>

      <div className="mt-10 flex gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-app-input px-6 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white"
          >
            Назад
          </button>
        ) : null}

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || allItems.length === 0}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-app-accent px-6 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
          >
            Отправить
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-app-input px-6 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white"
          >
            Далее
          </button>
        )}
      </div>
    </div>
  );
}
