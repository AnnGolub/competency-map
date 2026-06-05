export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersPageClient } from "@/components/designers/designers-page-client";
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
      <DesignersPageClient
        designers={designers}
        competencyExportColumns={competencyExportColumns}
      />
    </DesignersAppShell>
  );
}
