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
      <main className="font-avenir min-h-screen bg-app-canvas px-4 py-16 text-white">
        <div className="mx-auto max-w-lg">
          <h1 className="text-[30px] font-bold leading-9">Самооценка</h1>
          <p className="mt-4 text-sm text-app-placeholder">
            Неверная ссылка. Запросите новую у лида команды.
          </p>
        </div>
      </main>
    );
  }

  const data = await fetchPublicSelfReviewByToken(token);

  if (!data) {
    return (
      <main className="font-avenir min-h-screen bg-app-canvas px-4 py-16 text-white">
        <div className="mx-auto max-w-lg">
          <h1 className="text-[30px] font-bold leading-9">Самооценка</h1>
          <p className="mt-4 text-sm text-app-placeholder">
            Ссылка недействительна. Запросите новую у лида команды.
          </p>
        </div>
      </main>
    );
  }

  if (data.completed) {
    return (
      <main className="font-avenir min-h-screen bg-app-canvas px-4 py-16 text-white">
        <div className="mx-auto max-w-lg">
          <h1 className="text-[30px] font-bold leading-9">Самооценка</h1>
          <p className="mt-2 text-base leading-6 text-app-placeholder">
            {data.designerName} · {data.designerRole}
          </p>
          <p className="mt-6 rounded-xl border border-app-border bg-app-sidebar p-6 text-sm text-app-placeholder">
            Самооценка уже отправлена. Повторно заполнить форму по этой ссылке
            нельзя.
          </p>
        </div>
      </main>
    );
  }

  if (data.expired) {
    return (
      <main className="font-avenir min-h-screen bg-app-canvas px-4 py-16 text-white">
        <div className="mx-auto max-w-lg">
          <h1 className="text-[30px] font-bold leading-9">Самооценка</h1>
          <p className="mt-4 text-sm text-app-placeholder">
            Срок действия ссылки истёк. Запросите новую у лида команды.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="font-avenir min-h-screen bg-app-canvas px-4 py-10 text-white">
      <div className="mx-auto max-w-[1152px]">
        <header className="mb-10 max-w-[818px]">
          <h1 className="text-[30px] font-bold leading-9">Самооценка</h1>
          <p className="mt-1 text-base leading-6 text-app-placeholder">
            {data.designerName} · {data.designerRole}
          </p>
        </header>
        <PublicSelfReviewForm token={token} data={data} />
      </div>
    </main>
  );
}
