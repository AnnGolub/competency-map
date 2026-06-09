"use client";

import { useState } from "react";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersList } from "@/components/designers/designers-list";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import {
  DesignersTopBar,
  HEADER_GLASS_ICON_BUTTON,
} from "@/components/designers/designers-top-bar";
import { AppPageContent } from "@/lib/layout/content-shell";
import { IconPlus } from "@/components/ui/tabler-icons";
import type {
  CompetencyExportColumn,
  DesignerWithAverage,
} from "@/lib/data/queries";

export function DesignersPageClient({
  designers,
  competencyExportColumns,
}: {
  designers: DesignerWithAverage[];
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
              designers={designers}
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

      <main className="min-h-0 w-full flex-1 overflow-y-auto bg-white">
        <AppPageContent className="pb-12 pt-8">
          <DesignersList
            designers={designers}
            isAddModalOpen={isAddModalOpen}
            onAddModalOpenChange={setIsAddModalOpen}
          />
        </AppPageContent>
      </main>
    </>
  );
}
