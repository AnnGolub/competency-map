"use client";

import { useEffect, useState, useTransition } from "react";
import { generateSelfReviewLink } from "@/app/actions/self-review-token";
import { IconInformationCircle, IconX } from "@/components/ui/tabler-icons";
import { TooltipRightOf } from "@/components/ui/tooltip-bubble";

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
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    if (!dialogOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDialogOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen]);

  function handleGenerate() {
    setDialogOpen(true);
    setError(null);
    setCopied(false);
    setUrl(null);
    startTransition(async () => {
      const result = await generateSelfReviewLink(designerId);
      if (result.error) {
        setError(result.error);
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

  const generateButton = (
    <button
      type="button"
      disabled={isPending}
      onClick={handleGenerate}
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      className={
        variant === "profile"
          ? "font-sf relative inline-flex min-h-12 min-w-[104px] items-center justify-center gap-1 rounded-[10px] bg-[rgba(15,25,55,0.10)] px-5 py-1 text-base font-medium leading-6 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-opacity hover:opacity-90 disabled:opacity-50"
          : "relative mt-4 inline-flex items-center justify-center gap-1 rounded-lg border border-app-border bg-app-canvas px-4 py-2 text-sm font-medium text-white transition-colors hover:border-app-muted disabled:opacity-50"
      }
    >
      {isPending ? "Генерация…" : "Сгенерировать ссылку"}
      <IconInformationCircle
        className={`h-5 w-5 shrink-0 opacity-70 ${
          variant === "profile"
            ? "text-[rgba(60,60,67,0.66)]"
            : "text-white"
        }`}
      />
      {tooltipOpen ? (
        <TooltipRightOf>
          Одноразовая ссылка для отправки дизайнеру для оценки своих навыков по
          карте компетенций
        </TooltipRightOf>
      ) : null}
    </button>
  );

  const modal = dialogOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="self-review-link-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDialogOpen(false);
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-[480px] overflow-hidden rounded-xl border border-app-sidebar-border bg-app-sidebar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <h2
            id="self-review-link-title"
            className="text-lg font-bold leading-6 text-white"
          >
            Сгенерировать ссылку
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
            Одноразовая ссылка для дизайнера без входа в систему. Действует 14
            дней
          </p>

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

          <div className="mt-6">
            <div className="rounded-xl bg-app-input px-4 py-3 text-base leading-6 text-white">
              <span className="break-all">
                {url ?? (isPending ? "Генерация ссылки…" : "")}
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
  ) : null;

  if (variant === "profile") {
    return (
      <>
        {generateButton}
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="mt-6 rounded-xl border border-app-border bg-app-surface p-5">
        <h2 className="text-sm font-medium text-white">Самооценка дизайнера</h2>
        <p className="mt-1 text-sm text-app-muted">
          Одноразовая ссылка без входа в систему. Действует 14 дней.
        </p>
        {generateButton}
      </div>
      {modal}
    </>
  );
}
