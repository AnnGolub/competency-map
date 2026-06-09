export const dynamic = "force-dynamic";

import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import { fetchPublicQuestionnaireByToken } from "@/lib/data/questionnaire";

import { AppContentMain } from "@/lib/layout/content-shell";

function QuestionnaireShell({ children }: { children: React.ReactNode }) {
  return <AppContentMain>{children}</AppContentMain>;
}

function QuestionnaireMessage({ title, message }: { title: string; message: string }) {
  return (
    <QuestionnaireShell>
      <h1 className="font-sf text-[30px] font-bold leading-9 tracking-[0.1px] text-[rgba(3,3,6,0.88)]">
        {title}
      </h1>
      <p className="font-sf mt-4 text-base leading-6 text-[rgba(4,4,19,0.55)]">
        {message}
      </p>
    </QuestionnaireShell>
  );
}

export default async function QuestionnaireTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token?.trim();

  if (!token) {
    return (
      <QuestionnaireMessage
        title="Опросник"
        message="Неверная ссылка. Запросите новую у лида команды."
      />
    );
  }

  const data = await fetchPublicQuestionnaireByToken(token);

  if (!data) {
    return (
      <QuestionnaireMessage
        title="Опросник"
        message="Ссылка недействительна. Запросите новую у лида команды."
      />
    );
  }

  return (
    <QuestionnaireShell>
      <QuestionnaireForm token={token} designerName={data.designerName} />
    </QuestionnaireShell>
  );
}
