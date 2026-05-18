export const dynamic = "force-dynamic";

import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersList } from "@/components/designers/designers-list";
import { PageShell } from "@/components/ui/page-shell";
import { fetchDesignersWithAverages } from "@/lib/data/queries";

export default async function DesignersPage() {
  const { designers, competencyExportColumns } =
    await fetchDesignersWithAverages();

  return (
    <PageShell
      title="Дизайнеры"
      actions={
        <DesignersCsvExport
          designers={designers}
          competencyColumns={competencyExportColumns}
        />
      }
    >
      <DesignersList designers={designers} />
    </PageShell>
  );
}
