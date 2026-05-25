"use client";

import { useMemo, useState } from "react";
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

  const primaryButtonCls =
    "inline-flex h-10 items-center justify-center rounded-lg bg-app-accent px-5 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50";
  const secondaryButtonCls =
    "inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold leading-5 text-white transition-colors hover:opacity-90 disabled:opacity-50";

  function handleContinue() {
    setError(null);
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
        setError("Заполните все финальные значения шагом 0.5 в диапазоне от 1 до 4.");
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
      <p className="text-base leading-6 text-app-placeholder">
        Нет блоков компетенций для финального ревью.
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
              form={numericForm}
              onScoreChange={() => {}}
              renderItem={(item) => {
                const selfScore = scoresByItem[item.id]?.self_score;
                const leadScore = scoresByItem[item.id]?.score;
                const finalScore = form[item.id] ?? "";

                return (
                  <div>
                    <p
                      style={{
                        paddingBottom: "6px",
                        fontSize: "14px",
                        lineHeight: "18px",
                        color: "#8F90A6",
                      }}
                    >
                      {item.text}
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                        marginTop: "8px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            background: "#3E4153",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{ fontSize: "16px", color: "#fff", margin: 0 }}
                          >
                            {selfScore !== null && selfScore !== undefined
                              ? Number(selfScore).toFixed(1)
                              : "—"}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#8F90A6",
                            marginTop: "6px",
                          }}
                        >
                          Дизайнер
                        </p>
                      </div>
                      <div>
                        <div
                          style={{
                            background: "#3E4153",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{ fontSize: "16px", color: "#fff", margin: 0 }}
                          >
                            {leadScore !== null && leadScore !== undefined
                              ? Number(leadScore).toFixed(1)
                              : "—"}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#8F90A6",
                            marginTop: "6px",
                          }}
                        >
                          Лид
                        </p>
                      </div>
                      <div>
                        <div
                          style={{
                            background: "#3E4153",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #4A4D5E",
                          }}
                        >
                          <input
                            type="number"
                            min={1}
                            max={4}
                            step={0.5}
                            value={finalScore}
                            onChange={(event) =>
                              handleFinalScoreChange(item.id, event.target.value)
                            }
                            placeholder="—"
                            style={{
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              fontSize: "16px",
                              color: "#fff",
                              width: "100%",
                              padding: 0,
                              margin: 0,
                            }}
                          />
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#8F90A6",
                            marginTop: "6px",
                          }}
                        >
                          Финальное значение
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          ))}
        </div>
      </section>

      <div className="mt-10 flex gap-3">
        {!isFirstStep ? (
          <button
            type="button"
            onClick={handleBack}
            className={secondaryButtonCls}
            style={{ background: "#3E4153", color: "#C7C9D9" }}
          >
            Назад
          </button>
        ) : null}

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || allItems.length === 0}
            className={primaryButtonCls}
          >
            Сохранить и завершить
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className={primaryButtonCls}
          >
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
}
