"use client";

import { Fragment } from "react";
import { BLOCK_LABELS } from "@/lib/competency-utils";
import type { CompetencyBlock } from "@/types/database";

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10L8 14L16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden pt-5">
      <div
        className={`h-0.5 w-full rounded-lg ${
          completed ? "bg-[#05A660]" : "bg-app-input"
        }`}
      />
    </div>
  );
}

function ReviewStep({
  stepNumber,
  block,
  status,
}: {
  stepNumber: number;
  block: CompetencyBlock;
  status: "completed" | "active" | "pending";
}) {
  const isCompleted = status === "completed";
  const isActive = status === "active";

  const statusLabel = isCompleted
    ? "completed"
    : isActive
      ? "in progress"
      : "pending";

  return (
    <div className="flex w-[108px] shrink-0 flex-col items-center gap-2">
      <div
        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ${
          isCompleted ? "bg-[#05A660] text-white" : "bg-app-input text-[#C7C9D9]"
        }`}
      >
        {isCompleted ? (
          <IconCheck />
        ) : (
          <span className="h-5 w-5 rounded-full border-2 border-current opacity-60" />
        )}
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-xs leading-none text-white">step {stepNumber}</span>
        <span className="text-sm font-semibold leading-5 text-white">
          {BLOCK_LABELS[block]}
        </span>
        <span
          className={`inline-flex h-[22px] items-center justify-center rounded px-1 text-xs leading-none ${
            isCompleted
              ? "bg-[#05A660] text-white"
              : "bg-app-input text-[#C7C9D9]"
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

export function ReviewStepper({
  steps,
  currentIndex,
}: {
  steps: CompetencyBlock[];
  currentIndex: number;
}) {
  return (
    <div className="flex w-full max-w-[1152px] items-start gap-6">
      {steps.map((block, index) => {
        const status =
          index < currentIndex
            ? "completed"
            : index === currentIndex
              ? "active"
              : "pending";

        return (
          <Fragment key={block}>
            <ReviewStep
              stepNumber={index + 1}
              block={block}
              status={status}
            />
            {index < steps.length - 1 ? (
              <StepConnector completed={index < currentIndex} />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
