"use client";

import { useState } from "react";
import { DesignerFormModal } from "@/components/designers/designer-form-modal";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import {
  DesignersTopBar,
  DESIGNERS_CONTENT_SHELL,
  HEADER_GLASS_ICON_BUTTON,
} from "@/components/designers/designers-top-bar";
import { QuestionnaireList } from "@/components/questionnaire/questionnaire-list";
import { IconPlus } from "@/components/ui/tabler-icons";
import type {
  CompetencyExportColumn,
  DesignerWithAverage,
} from "@/lib/data/queries";
import type { QuestionnaireOverviewDesigner } from "@/lib/data/questionnaire";

export function QuestionnairePageClient({
  designers,
  exportDesigners,
  competencyExportColumns,
}: {
  designers: QuestionnaireOverviewDesigner[];
  exportDesigners: DesignerWithAverage[];
  competencyExportColumns: CompetencyExportColumn[];
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <DesignersTopBar
        title="Опросник"
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

      <main className={`min-h-0 flex-1 overflow-y-auto bg-white pb-12 pt-8 ${DESIGNERS_CONTENT_SHELL}`}>
        <QuestionnaireList designers={designers} />
      </main>

      <DesignerFormModal
        open={isAddModalOpen}
        title="Добавить дизайнера"
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
