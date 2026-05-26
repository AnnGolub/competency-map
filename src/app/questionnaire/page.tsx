export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";
import { DesignersTopBar } from "@/components/designers/designers-top-bar";
import { QuestionnaireList } from "@/components/questionnaire/questionnaire-list";
import { fetchQuestionnaireOverview } from "@/lib/data/questionnaire";
import { getSessionContext } from "@/lib/session";

export default async function QuestionnairePage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.isAdmin) {
    redirect("/no-access");
  }

  const designers = await fetchQuestionnaireOverview();

  return (
    <DesignersAppShell>
      <DesignersTopBar title="Опросник" actions={<DesignersLogoutButton />} />

      <main className="flex-1 px-8 pb-12 pt-8">
        <QuestionnaireList designers={designers} />
      </main>
    </DesignersAppShell>
  );
}
