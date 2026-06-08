"use client";

import { useEffect, useState } from "react";
import { generateQuestionnaireLink } from "@/app/actions/questionnaire";
import { generateSelfReviewLink } from "@/app/actions/self-review-token";
import { IconX } from "@/components/ui/tabler-icons";

type LinkTab = "competency" | "questionnaire";

const SECONDARY_BUTTON =
  "font-sf inline-flex min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[rgba(15,25,55,0.10)] px-5 py-1 text-base font-medium leading-6 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-opacity hover:opacity-90 disabled:opacity-50";

const PRIMARY_BUTTON =
  "font-sf inline-flex h-auto w-auto min-h-12 min-w-[104px] items-center justify-center self-start rounded-[10px] bg-[#212124] px-5 py-1 text-base font-medium leading-6 text-[rgba(255,255,255,0.94)] transition-opacity hover:opacity-90 disabled:opacity-50";

const MODAL_FIELD_LABEL =
  "font-sf text-sm leading-5 tracking-[-0.08px] text-[rgba(4,4,19,0.55)]";

const MODAL_FIELD_VALUE =
  "font-sf h-auto break-all text-base leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)]";

const TAB_CONFIG: Record<
  LinkTab,
  {
    label: string;
    description: string;
    loadingLabel: string;
  }
> = {
  competency: {
    label: "Карта компетенций",
    description:
      "Одноразовая ссылка для дизайнера без входа в систему. Действует 14 дней",
    loadingLabel: "Генерация ссылки…",
  },
  questionnaire: {
    label: "Опросник",
    description:
      "Многоразовая ссылка для сбора обратной связи о дизайнере от команды. Можно отправить любому",
    loadingLabel: "Создание ссылки…",
  },
};

function LinkField({
  url,
  isPending,
  loadingLabel,
}: {
  url: string | null;
  isPending: boolean;
  loadingLabel: string;
}) {
  return (
    <div className="flex w-full flex-col rounded-xl bg-[#F2F3F5] px-4 py-3.5">
      <span className={MODAL_FIELD_LABEL}>Ссылка</span>
      <span className={MODAL_FIELD_VALUE}>
        {url ?? (isPending ? loadingLabel : "")}
      </span>
    </div>
  );
}

export function GenerateDesignerLinksButton({
  designerId,
}: {
  designerId: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LinkTab>("competency");
  const [competencyUrl, setCompetencyUrl] = useState<string | null>(null);
  const [questionnaireUrl, setQuestionnaireUrl] = useState<string | null>(null);
  const [competencyError, setCompetencyError] = useState<string | null>(null);
  const [questionnaireError, setQuestionnaireError] = useState<string | null>(
    null
  );
  const [competencyPending, setCompetencyPending] = useState(false);
  const [questionnairePending, setQuestionnairePending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function fetchCompetencyLink() {
    if (competencyUrl || competencyPending) return;

    setCompetencyError(null);
    setCompetencyPending(true);
    try {
      const result = await generateSelfReviewLink(designerId);
      if (result.error) {
        setCompetencyError(result.error);
        return;
      }
      setCompetencyUrl(result.url ?? null);
    } finally {
      setCompetencyPending(false);
    }
  }

  async function fetchQuestionnaireLink() {
    if (questionnaireUrl || questionnairePending) return;

    setQuestionnaireError(null);
    setQuestionnairePending(true);
    try {
      const url = await generateQuestionnaireLink(designerId);
      setQuestionnaireUrl(url);
    } catch (error) {
      setQuestionnaireError(
        error instanceof Error ? error.message : "Не удалось создать ссылку"
      );
    } finally {
      setQuestionnairePending(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    setActiveTab("competency");
    setCopied(false);
    void fetchCompetencyLink();
  }

  function handleClose() {
    setOpen(false);
    setCopied(false);
  }

  function handleTabChange(tab: LinkTab) {
    setActiveTab(tab);
    setCopied(false);
    if (tab === "competency") {
      void fetchCompetencyLink();
    } else {
      void fetchQuestionnaireLink();
    }
  }

  async function handleCopy() {
    const url = activeTab === "competency" ? competencyUrl : questionnaireUrl;
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      if (activeTab === "competency") {
        setCompetencyError("Не удалось скопировать ссылку");
      } else {
        setQuestionnaireError("Не удалось скопировать ссылку");
      }
    }
  }

  const activeConfig = TAB_CONFIG[activeTab];
  const activeUrl = activeTab === "competency" ? competencyUrl : questionnaireUrl;
  const activeError =
    activeTab === "competency" ? competencyError : questionnaireError;
  const activePending =
    activeTab === "competency" ? competencyPending : questionnairePending;

  return (
    <>
      <button type="button" onClick={handleOpen} className={SECONDARY_BUTTON}>
        Сгенерировать ссылку
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="generate-links-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleClose();
          }}
        >
          <div
            className="relative w-[500px] overflow-hidden rounded-[24px] bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative px-7 pt-7">
              <h2
                id="generate-links-modal-title"
                className="font-sf pr-10 text-[22px] font-bold leading-[26px] tracking-[0.2px] text-[rgba(3,3,6,0.88)]"
              >
                Сгенерировать ссылку
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-7 top-7 inline-flex items-center justify-center text-[rgba(4,4,19,0.55)] transition-colors hover:text-[rgba(3,3,6,0.88)]"
                aria-label="Закрыть"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6 px-7 pb-10 pt-4">
              <div className="w-full self-stretch border-b border-[#DCDCDD]">
                <nav className="flex flex-wrap items-center gap-5">
                  {(Object.keys(TAB_CONFIG) as LinkTab[]).map((tab) => {
                    const active = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleTabChange(tab)}
                        className={`relative -mb-px flex h-10 items-center border-b-2 text-[18px] font-normal leading-[22px] transition-colors ${
                          active
                            ? "border-[#E53535] text-[#0F0F0F]"
                            : "border-transparent text-[rgba(60,60,67,0.66)] hover:text-[#0F0F0F]"
                        }`}
                      >
                        {TAB_CONFIG[tab].label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <p className="font-sf text-base font-normal leading-6 text-[rgba(3,3,6,0.88)]">
                {activeConfig.description}
              </p>

              {activeError ? (
                <p className="text-sm text-[#E53535]">{activeError}</p>
              ) : null}

              <LinkField
                url={activeUrl}
                isPending={activePending && !activeUrl}
                loadingLabel={activeConfig.loadingLabel}
              />

              <button
                type="button"
                disabled={!activeUrl || activePending}
                onClick={() => void handleCopy()}
                className={PRIMARY_BUTTON}
              >
                {copied ? "Скопировано!" : "Копировать ссылку"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
