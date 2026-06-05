export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DesignersAppShell } from "@/components/designers/designers-app-shell";
import { QuestionnairePageClient } from "@/components/questionnaire/questionnaire-page-client";
import { fetchQuestionnaireOverview } from "@/lib/data/questionnaire";
import { fetchDesignersWithAverages } from "@/lib/data/queries";
import { getSessionContext } from "@/lib/session";

export default async function QuestionnairePage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (!session.isAdmin) {
    redirect("/no-access");
  }

  const [designers, { designers: exportDesigners, competencyExportColumns }] =
    await Promise.all([
      fetchQuestionnaireOverview(),
      fetchDesignersWithAverages(),
    ]);

  return (
    <DesignersAppShell>
      <QuestionnairePageClient
        designers={designers}
        exportDesigners={exportDesigners}
        competencyExportColumns={competencyExportColumns}
      />
    </DesignersAppShell>
  );
}
