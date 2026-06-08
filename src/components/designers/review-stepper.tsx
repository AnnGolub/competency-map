"use client";

import { Fragment } from "react";
import { IconCheck, IconEye } from "@/components/ui/tabler-icons";
import { BLOCK_LABELS } from "@/lib/competency-utils";
import type { CompetencyBlock } from "@/types/database";

const STATUS_LABELS = {
  completed: "Завершено",
  active: "В процессе",
  pending: "Ожидание",
} as const;

function StepCircle({ status }: { status: "completed" | "active" | "pending" }) {
  const fill =
    status === "completed"
      ? "#0CC44D"
      : status === "active"
        ? "#2288FA"
        : "#BABBC2";

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full"
      style={{ backgroundColor: fill }}
      aria-hidden
    >
      {status === "completed" ? (
        <IconCheck className="h-4 w-4 text-white" />
      ) : (
        <IconEye
          className={`h-4 w-4 ${
            status === "active" ? "text-white" : "text-[rgba(4,4,19,0.55)]"
          }`}
        />
      )}
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
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      {steps.map((block, index) => {
        const status =
          index < currentIndex
            ? "completed"
            : index === currentIndex
              ? "active"
              : "pending";

        return (
          <Fragment key={block}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: 140,
              }}
            >
              <StepCircle status={status} />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(3,3,6,0.88)",
                    lineHeight: "16px",
                  }}
                >
                  {BLOCK_LABELS[block]}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(4,4,19,0.55)",
                    lineHeight: "16px",
                    marginTop: 4,
                  }}
                >
                  {STATUS_LABELS[status]}
                </div>
              </div>
            </div>
            {index < steps.length - 1 ? (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "#D2D3D9",
                  marginTop: 16,
                  marginLeft: 8,
                  marginRight: 8,
                  flexShrink: 1,
                }}
              />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
