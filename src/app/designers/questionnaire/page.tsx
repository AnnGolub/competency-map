export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import { DesignersTabPanel } from "@/components/designers/designers-tab-panel";
import { getSessionContext } from "@/lib/session";

export default async function QuestionnairePage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.isAdmin) {
    redirect("/no-access");
  }

  return (
    <DesignersAppShell>
      <DesignersTabPanel
        title="Опросник"
        actions={<DesignersLogoutButton />}
      />
      <main className="flex-1 px-8 pb-12 pt-8">
        <p className="max-w-xl text-base leading-6 text-app-muted">
          Раздел в разработке. Здесь позже появится опросник по компетенциям.
        </p>
        <Link
          href="/designers"
          className="mt-8 inline-block text-base font-semibold leading-6 text-app-accent transition-colors hover:text-app-accent-hover"
        >
          ← К списку дизайнеров
        </Link>
      </main>
    </DesignersAppShell>
  );
}
