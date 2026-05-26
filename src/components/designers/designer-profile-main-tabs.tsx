"use client";

import { useState } from "react";
import { DesignerMetricCards } from "@/components/designers/designer-metric-cards";
import { DesignerProfileResults } from "@/components/designers/designer-profile-results";
import { FeedbackTab } from "@/components/designers/feedback-tab";
import type {
  Competency,
  CompetencyItem,
  Designer,
  ItemScore,
} from "@/lib/competency-utils";

export function DesignerProfileMainTabs({
  designerId,
  designer,
  average,
  belowCount,
  growth,
  maxBelow,
  competencies,
  itemsByCompetency,
  scoresByItem,
  hasLeadReview,
  hasSelfReview,
  hasFinalReview,
}: {
  designerId: string;
  designer: Designer;
  average: number | null;
  belowCount: number;
  growth: number | null;
  maxBelow: number;
  competencies: Competency[];
  itemsByCompetency: Record<string, CompetencyItem[]>;
  scoresByItem: Record<string, ItemScore>;
  hasLeadReview: boolean;
  hasSelfReview: boolean;
  hasFinalReview: boolean;
}) {
  const [activeMainTab, setActiveMainTab] = useState<"map" | "feedback">("map");

  return (
    <section className="mt-8 max-w-[1152px]">
      <div
        style={{
          display: "flex",
          gap: "24px",
          borderBottom: "1px solid #2A2D3A",
          marginBottom: "32px",
        }}
      >
        {(["map", "feedback"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveMainTab(tab)}
            style={{
              paddingBottom: "12px",
              fontSize: "16px",
              fontWeight: activeMainTab === tab ? 600 : 400,
              color: activeMainTab === tab ? "#ffffff" : "#8F90A6",
              background: "none",
              border: "none",
              borderBottom:
                activeMainTab === tab ? "2px solid #fff" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {tab === "map" ? "Карта компетенций" : "Обратная связь"}
          </button>
        ))}
      </div>

      {activeMainTab === "map" ? (
        <>
          <DesignerMetricCards
            average={average}
            belowCount={belowCount}
            growth={growth}
            maxBelow={maxBelow}
            className="mt-0"
          />
          <DesignerProfileResults
            designer={designer}
            competencies={competencies}
            itemsByCompetency={itemsByCompetency}
            scoresByItem={scoresByItem}
            hasLeadReview={hasLeadReview}
            hasSelfReview={hasSelfReview}
            hasFinalReview={hasFinalReview}
          />
        </>
      ) : null}

      {activeMainTab === "feedback" ? <FeedbackTab designerId={designerId} /> : null}
    </section>
  );
}
