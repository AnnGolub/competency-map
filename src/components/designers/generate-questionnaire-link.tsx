"use client";

import { useEffect, useState, useTransition } from "react";
import { generateQuestionnaireLink } from "@/app/actions/questionnaire";
import { IconX } from "@/components/ui/tabler-icons";

export function GenerateQuestionnaireLink({
  designerId,
}: {
  designerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!dialogOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDialogOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen]);

  function handleOpen() {
    setDialogOpen(true);
    setError(null);
    setCopied(false);
    setUrl(null);

    startTransition(async () => {
      try {
        const nextUrl = await generateQuestionnaireLink(designerId);
        setUrl(nextUrl);
      } catch (generateError) {
        setError(
          generateError instanceof Error
            ? generateError.message
            : "Не удалось создать ссылку"
        );
      }
    });
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Не удалось скопировать ссылку");
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={handleOpen}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-app-input px-5 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white disabled:opacity-50"
      >
        Ссылка на опросник
      </button>

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="questionnaire-link-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialogOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-[480px] overflow-hidden rounded-xl border border-app-sidebar-border bg-app-sidebar shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <h2
                id="questionnaire-link-title"
                className="text-lg font-bold leading-6 text-white"
              >
                Ссылка на опросник
              </h2>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1 text-app-muted transition-colors hover:text-white"
                aria-label="Закрыть"
              >
                <IconX />
              </button>
            </div>
            <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-6 pb-6 pt-6">
              <p
                className="text-app-muted"
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontSize: "16px",
                  lineHeight: "24px",
                  fontWeight: 400,
                }}
              >
                Многоразовая ссылка для сбора обратной связи о дизайнере от команды.
                Можно отправить любому.
              </p>

              {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

              <div className="mt-6">
                <div className="rounded-xl bg-app-input px-4 py-3 text-base leading-6 text-white">
                  <span className="break-all">
                    {url ?? (isPending ? "Создание ссылки…" : "")}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!url}
                  onClick={handleCopy}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-app-accent px-6 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
                >
                  {copied ? "Скопировано!" : "Копировать ссылку"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
