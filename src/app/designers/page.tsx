export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersCsvExport } from "@/components/designers/designers-csv-export";
import { DesignersList } from "@/components/designers/designers-list";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
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
      <header className="flex items-start justify-between gap-6 px-10 pt-10">
        <h1 className="text-page-title font-semibold tracking-tight text-white">
          Дизайнеры
        </h1>
        <div className="flex items-center gap-2">
          <DesignersCsvExport
            designers={designers}
            competencyColumns={competencyExportColumns}
          />
          <DesignersLogoutButton />
        </div>
      </header>

      <main className="flex-1 px-10 pb-10 pt-8">
        <DesignersList designers={designers} />
      </main>
    </DesignersAppShell>
  );
}
