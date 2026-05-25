"use client";

import Link from "next/link";
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

      {isWaitingForReviews ? (
        <p className="mt-10 text-base leading-6 text-app-muted">
          Ревью ещё не завершено. Ожидается оценка{" "}
          {!hasLeadReview ? "лида" : "дизайнера"}.
        </p>
      ) : !hasFinalReview ? (
        <div className="mt-10">
          <p
            style={{
              color: "#ffffff",
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 400,
            }}
          >
            Ревью дизайнера выполнено самим дизайнером и лидом.
          </p>
          <p
            style={{
              color: "#ffffff",
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 400,
              marginTop: "4px",
            }}
          >
            Завершите ревью выбором окончательной оценки по каждой компетенции.
          </p>
          <Link
            href={`/designers/${designer.id}/review`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-app-accent px-5 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover"
          >
            Завершить ревью
          </Link>
        </div>
      ) : filteredCompetencies.length === 0 ? (
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
