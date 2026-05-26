export const dynamic = "force-dynamic";

import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import { fetchPublicQuestionnaireByToken } from "@/lib/data/questionnaire";

export default async function QuestionnaireTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token?.trim();

  if (!token) {
    return (
      <main className="font-avenir min-h-screen bg-app-canvas px-4 py-16 text-white">
        <div className="mx-auto max-w-[818px]">
          <h1 className="text-[30px] font-bold leading-9">Опросник</h1>
          <p className="mt-4 text-sm text-app-placeholder">
            Неверная ссылка. Запросите новую у лида команды.
          </p>
        </div>
      </main>
    );
  }

  const data = await fetchPublicQuestionnaireByToken(token);

  if (!data) {
    return (
      <main className="font-avenir min-h-screen bg-app-canvas px-4 py-16 text-white">
        <div className="mx-auto max-w-[818px]">
          <h1 className="text-[30px] font-bold leading-9">Опросник</h1>
          <p className="mt-4 text-sm text-app-placeholder">
            Ссылка недействительна. Запросите новую у лида команды.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="font-avenir min-h-screen bg-app-canvas px-4 py-10 text-white">
      <div className="mx-auto max-w-[1152px]">
        <QuestionnaireForm token={token} designerName={data.designerName} />
      </div>
    </main>
  );
}
