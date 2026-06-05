"use client";

import { useState } from "react";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersList } from "@/components/designers/designers-list";
import { DesignersTopBar } from "@/components/designers/designers-top-bar";
import { IconLayoutGrid, IconPlus } from "@/components/ui/tabler-icons";
import type {
  CompetencyExportColumn,
  DesignerWithAverage,
} from "@/lib/data/queries";

const HEADER_ICON_BUTTON =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#EDEEF0] bg-white p-1 text-[rgba(3,3,6,0.88)] transition-colors hover:bg-[#EDEEF0]";

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
              className={HEADER_ICON_BUTTON}
              aria-label="Добавить дизайнера"
              onClick={() => setIsAddModalOpen(true)}
            >
              <IconPlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={HEADER_ICON_BUTTON}
              aria-label="Переключить вид"
            >
              <IconLayoutGrid className="h-4 w-4" />
            </button>
          </>
        }
      />

      <main className="flex-1 bg-white px-8 pb-12 pt-8">
        <DesignersList
          designers={designers}
          isAddModalOpen={isAddModalOpen}
          onAddModalOpenChange={setIsAddModalOpen}
        />
      </main>
    </>
  );
}
