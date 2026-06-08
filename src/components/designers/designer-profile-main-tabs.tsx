"use client";

import { useState } from "react";
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
  competencies,
  itemsByCompetency,
  scoresByItem,
  hasLeadReview,
  hasSelfReview,
  hasFinalReview,
}: {
  designerId: string;
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: Record<string, CompetencyItem[]>;
  scoresByItem: Record<string, ItemScore>;
  hasLeadReview: boolean;
  hasSelfReview: boolean;
  hasFinalReview: boolean;
}) {
  const [activeMainTab, setActiveMainTab] = useState<"map" | "feedback">("map");

  return (
    <section className="w-full max-w-[1440px]">
      <div className="w-full self-stretch border-b border-[#DCDCDD]">
        <nav className="flex flex-wrap items-center gap-5">
          {(
            [
              { id: "map" as const, label: "Карта компетенций" },
              { id: "feedback" as const, label: "Обратная связь" },
            ] as const
          ).map((tab) => {
            const active = activeMainTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={`relative -mb-px flex h-10 items-center border-b-2 text-[18px] font-normal leading-[22px] transition-colors ${
                  active
                    ? "border-[#E53535] text-[#0F0F0F]"
                    : "border-transparent text-[rgba(60,60,67,0.66)] hover:text-[#0F0F0F]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeMainTab === "map" ? (
        <DesignerProfileResults
          designer={designer}
          competencies={competencies}
          itemsByCompetency={itemsByCompetency}
          scoresByItem={scoresByItem}
          hasLeadReview={hasLeadReview}
          hasSelfReview={hasSelfReview}
          hasFinalReview={hasFinalReview}
        />
      ) : null}

      {activeMainTab === "feedback" ? (
        <FeedbackTab designerId={designerId} />
      ) : null}
    </section>
  );
}
