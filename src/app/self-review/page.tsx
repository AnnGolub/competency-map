export const dynamic = "force-dynamic";

import { PublicSelfReviewForm } from "@/components/self-review/public-self-review-form";
import { fetchPublicSelfReviewByToken } from "@/lib/data/self-review-tokens";

function SelfReviewShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white px-8 py-8">
      <div className="mx-auto w-full max-w-[1152px]">{children}</div>
    </main>
  );
}

function SelfReviewMessage({
  title,
  subtitle,
  message,
}: {
  title: string;
  subtitle?: string;
  message: string;
}) {
  return (
    <SelfReviewShell>
      <header className="flex flex-col gap-2">
        <h1 className="font-sf text-[30px] font-bold leading-9 tracking-[0.1px] text-[rgba(3,3,6,0.88)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="font-sf text-base font-normal leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)]">
            {subtitle}
          </p>
        ) : null}
      </header>
      <p className="font-sf mt-6 rounded-[24px] bg-[#F2F3F5] p-6 text-sm leading-5 text-[rgba(4,4,19,0.55)]">
        {message}
      </p>
    </SelfReviewShell>
  );
}

export default async function SelfReviewPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim();

  if (!token) {
    return (
      <SelfReviewMessage
        title="Самооценка"
        message="Неверная ссылка. Запросите новую у лида команды."
      />
    );
  }

  const data = await fetchPublicSelfReviewByToken(token);

  if (!data) {
    return (
      <SelfReviewMessage
        title="Самооценка"
        message="Ссылка недействительна. Запросите новую у лида команды."
      />
    );
  }

  if (data.completed) {
    return (
      <SelfReviewMessage
        title="Самооценка"
        subtitle={data.designerName}
        message="Самооценка уже отправлена. Повторно заполнить форму по этой ссылке нельзя."
      />
    );
  }

  if (data.expired) {
    return (
      <SelfReviewMessage
        title="Самооценка"
        subtitle={data.designerName}
        message="Срок действия ссылки истёк. Запросите новую у лида команды."
      />
    );
  }

  return (
    <SelfReviewShell>
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-sf text-[30px] font-bold leading-9 tracking-[0.1px] text-[rgba(3,3,6,0.88)]">
          Самооценка — {data.designerName}
        </h1>
        <p className="font-sf text-base font-normal leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)]">
          {data.designerRole}
        </p>
      </header>
      <PublicSelfReviewForm token={token} data={data} />
    </SelfReviewShell>
  );
}
