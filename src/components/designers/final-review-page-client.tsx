"use client";

import { useState } from "react";
import { DesignerFormModal } from "@/components/designers/designer-form-modal";
import { FinalReviewForm } from "@/components/designers/final-review-form";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import {
  DesignersTopBar,
  DESIGNERS_CONTENT_SHELL,
  HEADER_GLASS_ICON_BUTTON,
} from "@/components/designers/designers-top-bar";
import { ReviewPageHeader } from "@/components/designers/review-page-header";
import { IconPlus } from "@/components/ui/tabler-icons";
import type {
  ItemsByCompetencyRecord,
  ScoresByItemRecord,
  CompetencyExportColumn,
  DesignerWithAverage,
} from "@/lib/data/queries";
import type { Competency, Designer } from "@/lib/competency-utils";

export function FinalReviewPageClient({
  designer,
  competencies,
  itemsByCompetency,
  scoresByItem,
  exportDesigners,
  competencyExportColumns,
}: {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: ItemsByCompetencyRecord;
  scoresByItem: ScoresByItemRecord;
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

      <main className={`flex min-h-0 w-full flex-1 flex-col gap-8 self-stretch overflow-y-auto bg-white pb-8 pt-8 ${DESIGNERS_CONTENT_SHELL}`}>
        <div className="flex w-full flex-col gap-8 self-stretch">
          <ReviewPageHeader designer={designer} title="Финальное ревью" />

          <FinalReviewForm
            designer={designer}
            competencies={competencies}
            itemsByCompetency={itemsByCompetency}
            scoresByItem={scoresByItem}
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
