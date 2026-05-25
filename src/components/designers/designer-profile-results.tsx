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

export function DesignerProfileResults({
  designer,
  competencies,
  itemsByCompetency,
  scoresByItem,
}: {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: Record<string, CompetencyItem[]>;
  scoresByItem: Record<string, ItemScore>;
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

  return (
    <section className="mt-10 max-w-[1152px]">
      <nav className="flex flex-wrap items-center gap-5">
        {tabs.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`border-b-2 pb-1 text-base font-normal leading-[22px] transition-colors ${
                active
                  ? "border-white text-white"
                  : "border-transparent text-app-muted hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {filteredCompetencies.length === 0 ? (
        <p className="mt-6 text-base leading-6 text-app-muted">
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
