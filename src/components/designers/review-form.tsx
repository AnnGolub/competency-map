"use client";

import { useState } from "react";
import { ReviewCompetencyCard } from "@/components/designers/review-competency-card";
import { ReviewStepper } from "@/components/designers/review-stepper";
import { saveReview, type ReviewEntry } from "@/app/actions/review";
import type {
  ItemsByCompetencyRecord,
  ScoresByItemRecord,
} from "@/lib/data/queries";
import {
  BLOCK_LABELS,
  blocksForDesignerRole,
  groupByBlock,
  type Competency,
  type CompetencyItem,
  type Designer,
} from "@/lib/competency-utils";
import type { CompetencyBlock } from "@/types/database";

const REVIEW_STEP_ORDER: CompetencyBlock[] = ["hard", "soft", "leadership"];

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

const PRIMARY_BUTTON =
  "font-sf inline-flex h-auto w-auto min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[#212124] px-5 py-1 text-base font-medium leading-6 text-[rgba(255,255,255,0.94)] transition-opacity hover:opacity-90 disabled:opacity-50";

const SECONDARY_BUTTON =
  "font-sf inline-flex h-auto w-auto min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[rgba(15,25,55,0.10)] px-5 py-1 text-base font-medium leading-6 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-opacity hover:opacity-90 disabled:opacity-50";

export function ReviewForm({
  designer,
  competencies,
  itemsByCompetency,
  scoresByItem,
}: {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: ItemsByCompetencyRecord;
  scoresByItem: ScoresByItemRecord;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(itemsByCompetency, scoresByItem)
  );

  const grouped = groupByBlock(competencies);
  const roleBlocks = blocksForDesignerRole(designer.role);
  const steps = REVIEW_STEP_ORDER.filter((block) => roleBlocks.includes(block));
  const currentBlock = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const allItems = collectAllItems(competencies, itemsByCompetency);
  const blockCompetencies = currentBlock ? grouped[currentBlock] : [];

  function handleScoreChange(itemId: string, score: number) {
    setForm((prev) => ({ ...prev, [itemId]: score }));
  }

  function handleContinue() {
    setError(null);
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setError(null);
    if (!isFirstStep) {
      setStepIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const entries: ReviewEntry[] = allItems.map((item) => ({
      competencyItemId: item.id,
      score: form[item.id],
    }));

    try {
      const result = await saveReview(designer.id, entries);
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  if (steps.length === 0) {
    return (
      <p className="font-sf text-base leading-6 text-[rgba(60,60,67,0.66)]">
        Нет блоков компетенций для ревью.
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
              role={designer.role}
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
