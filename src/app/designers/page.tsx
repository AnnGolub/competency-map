export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersList } from "@/components/designers/designers-list";
import { PageShell } from "@/components/ui/page-shell";
import { fetchDesignersWithAverages } from "@/lib/data/queries";
import { getSessionContext } from "@/lib/session";

export default async function DesignersPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.isAdmin) {
    redirect("/no-access");
  }

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
