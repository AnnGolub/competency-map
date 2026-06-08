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

const PRIMARY_BUTTON =
  "font-sf inline-flex h-auto w-auto min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[#212124] px-5 py-1 text-base font-medium leading-6 text-[rgba(255,255,255,0.94)] transition-opacity hover:opacity-90 disabled:opacity-50";

const SECONDARY_BUTTON =
  "font-sf inline-flex h-auto w-auto min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[rgba(15,25,55,0.10)] px-5 py-1 text-base font-medium leading-6 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-opacity hover:opacity-90 disabled:opacity-50";

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
  const isFirstStep = stepIndex === 0;
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
      <div className="rounded-[24px] bg-[#F2F3F5] p-6 text-center">
        <p className="font-sf text-base font-medium leading-6 text-[rgba(3,3,6,0.88)]">
          Спасибо!
        </p>
        <p className="font-sf mt-2 text-sm leading-5 text-[rgba(4,4,19,0.55)]">
          Самооценка отправлена. Повторно заполнить форму по этой ссылке нельзя.
        </p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <p className="font-sf text-base leading-6 text-[rgba(60,60,67,0.66)]">
        Нет блоков компетенций для самооценки.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col self-stretch">
      <div className="w-full">
        <ReviewStepper steps={steps} currentIndex={stepIndex} />
      </div>

      {error ? (
        <p className="mt-6 rounded-lg border border-[#E53535]/30 bg-[#E53535]/10 px-3 py-2 text-sm text-[#E53535]">
          {error}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-sf text-[22px] font-bold leading-[26px] tracking-[0.2px] text-[rgba(3,3,6,0.88)]">
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

      <div className="mt-8 flex gap-4">
        {!isFirstStep ? (
          <button type="button" onClick={handleBack} className={SECONDARY_BUTTON}>
            Назад
          </button>
        ) : null}

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || allItems.length === 0}
            className={PRIMARY_BUTTON}
          >
            Отправить
          </button>
        ) : (
          <button type="button" onClick={handleContinue} className={PRIMARY_BUTTON}>
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
}
