"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  saveFinalReview,
  type FinalReviewEntry,
} from "@/app/actions/review";
import { ReviewCompetencyCard } from "@/components/designers/review-competency-card";
import { ReviewStepper } from "@/components/designers/review-stepper";
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
const FINAL_SCORE_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4] as const;

const PRIMARY_BUTTON =
  "font-sf inline-flex h-auto w-auto min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[#212124] px-5 py-1 text-base font-medium leading-6 text-[rgba(255,255,255,0.94)] transition-opacity hover:opacity-90 disabled:opacity-50";

const SECONDARY_BUTTON =
  "font-sf inline-flex h-auto w-auto min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[rgba(15,25,55,0.10)] px-5 py-1 text-base font-medium leading-6 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-opacity hover:opacity-90 disabled:opacity-50";

const SCORE_BADGE =
  "font-sf inline-flex shrink-0 items-center rounded-[6px] bg-[#F2F3F5] px-2 py-0.5 text-sm tabular-nums leading-5 text-[rgba(3,3,6,0.88)]";

const FINAL_SELECT =
  "font-sf w-[72px] shrink-0 rounded-lg border-0 bg-[#F2F3F5] px-2 py-1 text-sm leading-5 text-[rgba(3,3,6,0.88)] outline-none";

type FormState = Record<string, string>;

function buildInitialState(
  itemsByCompetency: ItemsByCompetencyRecord,
  scoresByItem: ScoresByItemRecord
): FormState {
  const state: FormState = {};
  for (const items of Object.values(itemsByCompetency)) {
    for (const item of items) {
      const existing = scoresByItem[item.id]?.final_score;
      state[item.id] =
        existing !== null && existing !== undefined ? Number(existing).toFixed(1) : "";
    }
  }
  return state;
}

function collectAllItems(
  competencies: Competency[],
  itemsByCompetency: ItemsByCompetencyRecord
): CompetencyItem[] {
  const result: CompetencyItem[] = [];
  for (const competency of competencies) {
    result.push(...(itemsByCompetency[competency.id] ?? []));
  }
  return result;
}

function parseScore(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return null;
  return numeric;
}

function normalizeInputValue(value: string): string {
  if (value === "") return "";
  if (/^\d+([.,]\d{0,1})?$/.test(value)) {
    return value.replace(",", ".");
  }
  return value;
}

function isValidStepScore(value: number): boolean {
  return value >= 1 && value <= 4 && Math.round(value * 10) % 5 === 0;
}

function formatOptionalScore(value: number | null | undefined) {
  return value !== null && value !== undefined ? Number(value).toFixed(1) : "—";
}

function FinalReviewItemRow({
  text,
  selfScore,
  leadScore,
  finalScore,
  onFinalScoreChange,
}: {
  text: string;
  selfScore: number | null | undefined;
  leadScore: number | null | undefined;
  finalScore: string;
  onFinalScoreChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:gap-4">
      <p className="font-sf text-sm leading-[18px] text-[rgba(3,3,6,0.88)]">{text}</p>
      <span className={SCORE_BADGE}>{formatOptionalScore(selfScore)}</span>
      <span className={SCORE_BADGE}>{formatOptionalScore(leadScore)}</span>
      <select
        value={finalScore}
        onChange={(event) => onFinalScoreChange(event.target.value)}
        className={FINAL_SELECT}
        aria-label={`Финальная оценка: ${text}`}
      >
        <option value="">—</option>
        {FINAL_SCORE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option.toFixed(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FinalReviewForm({
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
  const numericForm = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(form).map(([itemId, value]) => [itemId, parseScore(value)])
      ) as Record<string, number | null>,
    [form]
  );

  function handleContinue() {
    setError(null);

    const stepItems = blockCompetencies.flatMap(
      (competency) => itemsByCompetency[competency.id] ?? []
    );
    for (const item of stepItems) {
      const parsed = parseScore(form[item.id] ?? "");
      if (parsed === null || !isValidStepScore(parsed)) {
        setError("Выберите все финальные значения");
        return;
      }
    }

    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setError(null);
    if (!isFirstStep) {
      setStepIndex((current) => current - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleFinalScoreChange(itemId: string, value: string) {
    setForm((prev) => ({ ...prev, [itemId]: normalizeInputValue(value) }));
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setError(null);

    const entries: FinalReviewEntry[] = [];
    for (const item of allItems) {
      const parsed = parseScore(form[item.id] ?? "");
      if (parsed === null || !isValidStepScore(parsed)) {
        setError("Выберите все финальные значения");
        return;
      }
      entries.push({
        competencyItemId: item.id,
        finalScore: parsed,
      });
    }

    setIsSubmitting(true);

    try {
      const result = await saveFinalReview(designer.id, entries);
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (submitError) {
      setIsSubmitting(false);
      throw submitError;
    }
  }

  if (steps.length === 0) {
    return (
      <p className="font-sf text-base leading-6 text-[rgba(60,60,67,0.66)]">
        Нет блоков компетенций для финального ревью.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col self-stretch">
      <div className="w-full">
        <ReviewStepper steps={steps} currentIndex={stepIndex} />
      </div>

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
              form={numericForm}
              onScoreChange={() => {}}
              renderItem={(item) => (
                <FinalReviewItemRow
                  text={item.text}
                  selfScore={scoresByItem[item.id]?.self_score}
                  leadScore={scoresByItem[item.id]?.score}
                  finalScore={form[item.id] ?? ""}
                  onFinalScoreChange={(value) =>
                    handleFinalScoreChange(item.id, value)
                  }
                />
              )}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 flex items-center gap-4">
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

        {error ? (
          <div className="flex h-12 items-center gap-1 rounded-xl bg-[#FFEFD9] px-3">
            <Image
              src="/icons/Designer/Profile/LeftAddon.svg"
              alt=""
              width={24}
              height={24}
              className="shrink-0"
            />
            <p className="font-sf text-sm leading-5 tracking-[-0.08px] text-[rgba(3,3,6,0.88)]">
              {error}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
