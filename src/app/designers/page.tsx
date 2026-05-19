export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersList } from "@/components/designers/designers-list";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import { DesignersTabPanel } from "@/components/designers/designers-tab-panel";
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
    <DesignersAppShell>
      <DesignersTabPanel
        title="Дизайнеры"
        actions={
          <>
            <DesignersCsvExport
              designers={designers}
              competencyColumns={competencyExportColumns}
            />
            <DesignersLogoutButton />
          </>
        }
      />

      <main className="flex-1 px-8 pb-12 pt-8">
        <DesignersList designers={designers} />
      </main>
    </DesignersAppShell>
  );
}
