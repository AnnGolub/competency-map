"use client";

import { useMemo, useState } from "react";
import { CompetencyResultCard } from "@/components/designers/competency-result-card";
import {
  BLOCK_LABELS,
  blocksForDesignerRole,
  type Competency,
  type CompetencyItem,
  type Designer,
  type ItemScore,
} from "@/lib/competency-utils";
import type { CompetencyBlock } from "@/types/database";

type BlockTab = "all" | CompetencyBlock;

const BLOCK_TABS: CompetencyBlock[] = ["hard", "soft", "leadership"];

const TAB_ACTIVE =
  "font-sf inline-flex min-h-10 min-w-16 items-center justify-center rounded-full bg-[#212124] px-3 py-1 text-sm font-normal leading-5 text-[rgba(255,255,255,0.94)]";

const TAB_INACTIVE =
  "font-sf inline-flex min-h-10 min-w-16 items-center justify-center rounded-full bg-[rgba(15,25,55,0.10)] px-3 py-1 text-sm font-normal leading-5 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-colors";

export function DesignerProfileResults({
  designer,
  competencies,
  itemsByCompetency,
  scoresByItem,
  hasLeadReview,
  hasSelfReview,
  hasFinalReview,
}: {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: Record<string, CompetencyItem[]>;
  scoresByItem: Record<string, ItemScore>;
  hasLeadReview: boolean;
  hasSelfReview: boolean;
  hasFinalReview: boolean;
}) {
  const [activeTab, setActiveTab] = useState<BlockTab>("all");
  const roleBlocks = blocksForDesignerRole(designer.role);

  const tabs: { value: BlockTab; label: string }[] = useMemo(
    () => [
      { value: "all", label: "Все" },
      ...BLOCK_TABS.filter((block) => roleBlocks.includes(block)).map(
        (block) => ({
          value: block,
          label: BLOCK_LABELS[block],
        })
      ),
    ],
    [roleBlocks]
  );

  const filteredCompetencies = useMemo(() => {
    if (activeTab === "all") return competencies;
    return competencies.filter((c) => c.block === activeTab);
  }, [competencies, activeTab]);

  const isWaitingForReviews = !hasLeadReview || !hasSelfReview;

  return (
    <section className="mt-8 w-full max-w-[1440px]">
      <nav className="flex flex-row flex-wrap items-start gap-3">
        {tabs.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={active ? TAB_ACTIVE : TAB_INACTIVE}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {isWaitingForReviews ? (
        <p className="mt-8 text-base leading-6 text-[rgba(60,60,67,0.66)]">
          Ревью ещё не завершено. Ожидается оценка{" "}
          {!hasLeadReview ? "лида" : "дизайнера"}.
        </p>
      ) : !hasFinalReview ? (
        <div className="mt-8">
          <p className="font-sf text-base font-normal leading-6 text-[rgba(3,3,6,0.88)]">
            Ревью дизайнера выполнено самим дизайнером и лидом.
          </p>
          <p className="font-sf mt-1 text-base font-normal leading-6 text-[rgba(3,3,6,0.88)]">
            Завершите ревью выбором окончательной оценки по каждой компетенции.
          </p>
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <p className="mt-8 text-base leading-6 text-[rgba(60,60,67,0.66)]">
          Нет компетенций по выбранному фильтру.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {filteredCompetencies.map((competency) => (
            <CompetencyResultCard
              key={competency.id}
              competency={competency}
              items={itemsByCompetency[competency.id] ?? []}
              role={designer.role}
              scoresByItem={scoresByItem}
            />
          ))}
        </div>
      )}
    </section>
  );
}
