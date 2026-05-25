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
      <p className="text-base leading-6 text-app-placeholder">
        Нет блоков компетенций для ревью.
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
              role={designer.role}
              form={form}
              onScoreChange={handleScoreChange}
            />
          ))}
        </div>
      </section>

      <div className="mt-10">
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
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
}
