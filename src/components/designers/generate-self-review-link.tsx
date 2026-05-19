"use client";

import { useState, useTransition } from "react";
import { generateSelfReviewLink } from "@/app/actions/self-review-token";
import { IconX } from "@/components/ui/tabler-icons";

export function GenerateSelfReviewLink({
  designerId,
  variant = "card",
}: {
  designerId: string;
  variant?: "card" | "profile";
}) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleGenerate() {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await generateSelfReviewLink(designerId);
      if (result.error) {
        setError(result.error);
        setUrl(null);
        if (variant === "profile") setDialogOpen(true);
        return;
      }
      setUrl(result.url ?? null);
      if (variant === "profile" && result.url) setDialogOpen(true);
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

  const generateButton = (
    <button
      type="button"
      disabled={isPending}
      onClick={handleGenerate}
      className={
        variant === "profile"
          ? "inline-flex h-10 items-center justify-center rounded-lg bg-app-input px-5 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white disabled:opacity-50"
          : "mt-4 rounded-lg border border-app-border bg-app-canvas px-4 py-2 text-sm font-medium text-white transition-colors hover:border-app-muted disabled:opacity-50"
      }
    >
      {isPending ? "Генерация…" : "Сгенерировать ссылку"}
    </button>
  );

  if (variant === "profile") {
    return (
      <>
        {generateButton}
        {dialogOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="self-review-link-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDialogOpen(false);
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-app-border bg-app-sidebar p-6 shadow-xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2
                  id="self-review-link-title"
                  className="text-base font-semibold text-white"
                >
                  Ссылка на самооценку
                </h2>
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg p-1 text-app-muted transition-colors hover:text-white"
                  aria-label="Закрыть"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-app-placeholder">
                Одноразовая ссылка без входа в систему. Действует 14 дней.
              </p>
              {error ? (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              ) : null}
              {url ? (
                <div className="mt-4">
                  <p className="break-all rounded-lg border border-app-border bg-app-canvas px-3 py-2 text-sm text-white/80">
                    {url}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="mt-3 text-sm font-medium text-app-accent transition-colors hover:text-app-accent-hover"
                  >
                    {copied ? "Скопировано" : "Копировать ссылку"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-app-border bg-app-surface p-5">
      <h2 className="text-sm font-medium text-white">Самооценка дизайнера</h2>
      <p className="mt-1 text-sm text-app-muted">
        Одноразовая ссылка без входа в систему. Действует 14 дней.
      </p>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      {url ? (
        <div className="mt-4">
          <p className="break-all rounded-lg border border-app-border bg-app-canvas px-3 py-2 text-sm text-white/80">
            {url}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-2 text-sm text-app-accent transition-colors hover:text-app-accent-hover"
          >
            {copied ? "Скопировано" : "Копировать ссылку"}
          </button>
        </div>
      ) : null}

      {generateButton}
    </div>
  );
}
