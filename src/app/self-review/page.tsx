export const dynamic = "force-dynamic";

import { PublicSelfReviewForm } from "@/components/self-review/public-self-review-form";
import { fetchPublicSelfReviewByToken } from "@/lib/data/self-review-tokens";

export default async function SelfReviewPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim();

  if (!token) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-medium">Самооценка</h1>
        <p className="mt-4 text-sm text-neutral-600">
          Неверная ссылка. Запросите новую у лида команды.
        </p>
      </main>
    );
  }

  const data = await fetchPublicSelfReviewByToken(token);

  if (!data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-medium">Самооценка</h1>
        <p className="mt-4 text-sm text-neutral-600">
          Ссылка недействительна. Запросите новую у лида команды.
        </p>
      </main>
    );
  }

  if (data.completed) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-medium">Самооценка</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {data.designerName} · {data.designerRole}
        </p>
        <p className="mt-6 rounded-lg border-[0.5px] border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
          Самооценка уже отправлена. Повторно заполнить форму по этой ссылке
          нельзя.
        </p>
      </main>
    );
  }

  if (data.expired) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-medium">Самооценка</h1>
        <p className="mt-4 text-sm text-neutral-600">
          Срок действия ссылки истёк. Запросите новую у лида команды.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight">Самооценка</h1>
        <p className="mt-1 text-neutral-500">
          {data.designerName} · {data.designerRole}
        </p>
      </header>
      <PublicSelfReviewForm token={token} data={data} />
    </main>
  );
}
