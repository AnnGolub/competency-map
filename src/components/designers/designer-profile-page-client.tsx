"use client";

import { useState } from "react";
import { DesignerFormModal } from "@/components/designers/designer-form-modal";
import { DesignerBackLink } from "@/components/designers/designer-back-link";
import { DesignerMetricCards } from "@/components/designers/designer-metric-cards";
import { DesignerProfileHeader } from "@/components/designers/designer-profile-header";
import { DesignerProfileMainTabs } from "@/components/designers/designer-profile-main-tabs";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import {
  DesignersTopBar,
  HEADER_GLASS_ICON_BUTTON,
} from "@/components/designers/designers-top-bar";
import { IconPlus } from "@/components/ui/tabler-icons";
import type {
  Competency,
  CompetencyItem,
  Designer,
  ItemScore,
} from "@/lib/competency-utils";
import type {
  CompetencyExportColumn,
  DesignerWithAverage,
} from "@/lib/data/queries";

export function DesignerProfilePageClient({
  designer,
  lastReviewAt,
  hasFinalReview,
  average,
  belowCount,
  growth,
  maxBelow,
  competencies,
  itemsByCompetency,
  scoresByItem,
  hasLeadReview,
  hasSelfReview,
  exportDesigners,
  competencyExportColumns,
}: {
  designer: Designer;
  lastReviewAt: string | null;
  hasFinalReview: boolean;
  average: number | null;
  belowCount: number;
  growth: number | null;
  maxBelow: number;
  competencies: Competency[];
  itemsByCompetency: Record<string, CompetencyItem[]>;
  scoresByItem: Record<string, ItemScore>;
  hasLeadReview: boolean;
  hasSelfReview: boolean;
  exportDesigners: DesignerWithAverage[];
  competencyExportColumns: CompetencyExportColumn[];
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <DesignersTopBar
        title="Дизайнеры"
        actions={
          <>
            <DesignersCsvExport
              designers={exportDesigners}
              competencyColumns={competencyExportColumns}
            />
            <button
              type="button"
              className={HEADER_GLASS_ICON_BUTTON}
              aria-label="Добавить дизайнера"
              onClick={() => setIsAddModalOpen(true)}
            >
              <IconPlus className="h-4 w-4" />
            </button>
            <DesignersLogoutButton className={HEADER_GLASS_ICON_BUTTON} />
          </>
        }
      />

      <main className="flex flex-1 flex-col gap-8 px-8 pb-12 pt-8">
        <div className="flex w-full max-w-[1440px] flex-col gap-8">
          <DesignerBackLink href="/designers">К списку дизайнеров</DesignerBackLink>

          <div className="flex w-full flex-wrap items-start gap-8">
            <DesignerProfileHeader
              designer={designer}
              lastReviewAt={lastReviewAt}
              hasFinalReview={hasFinalReview}
            />
            <DesignerMetricCards
              variant="sidebar"
              average={average}
              belowCount={belowCount}
              growth={growth}
              maxBelow={maxBelow}
            />
          </div>

          <DesignerProfileMainTabs
            designerId={designer.id}
            designer={designer}
            competencies={competencies}
            itemsByCompetency={itemsByCompetency}
            scoresByItem={scoresByItem}
            hasLeadReview={hasLeadReview}
            hasSelfReview={hasSelfReview}
            hasFinalReview={hasFinalReview}
          />
        </div>
      </main>

      <DesignerFormModal
        open={isAddModalOpen}
        title="Добавить дизайнера"
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
