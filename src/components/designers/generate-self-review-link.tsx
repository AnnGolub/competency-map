"use client";

import { useState, useTransition } from "react";
import { generateSelfReviewLink } from "@/app/actions/self-review-token";

export function GenerateSelfReviewLink({ designerId }: { designerId: string }) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await generateSelfReviewLink(designerId);
      if (result.error) {
        setError(result.error);
        setUrl(null);
        return;
      }
      setUrl(result.url ?? null);
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

      <button
        type="button"
        disabled={isPending}
        onClick={handleGenerate}
        className="mt-4 rounded-lg border border-app-border bg-app-canvas px-4 py-2 text-sm font-medium text-white transition-colors hover:border-app-muted disabled:opacity-50"
      >
        {isPending ? "Генерация…" : "Сгенерировать ссылку"}
      </button>
    </div>
  );
}
