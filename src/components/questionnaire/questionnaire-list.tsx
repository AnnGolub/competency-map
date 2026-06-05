"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { generateQuestionnaireLink } from "@/app/actions/questionnaire";
import { IconChevronDown } from "@/components/ui/tabler-icons";
import type { QuestionnaireOverviewDesigner } from "@/lib/data/questionnaire";
import { DESIGNER_ROLES, ROLE_LABELS } from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type RoleFilter = "all" | DesignerRole;
type SortKey =
  | "role"
  | "responses"
  | "mentorship"
  | "processes"
  | "communication";

const FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Все" },
  ...DESIGNER_ROLES.map((role) => ({
    value: role as RoleFilter,
    label: ROLE_LABELS[role],
  })),
];

const ROLE_ORDER: Record<DesignerRole, number> = {
  junior: 0,
  middle: 1,
  senior: 2,
  lead: 3,
};

const TABLE_ROW =
  "flex w-full items-center gap-2 self-stretch rounded-xl bg-[#F2F3F5] px-6 py-4";
const TABLE_HEADER_ROW =
  "flex w-full items-start gap-2 self-stretch rounded-xl bg-[#F2F3F5] px-6 py-4";
const HEADER_COL =
  "font-sf flex min-w-0 flex-1 flex-col items-start text-xs font-normal leading-4 text-[rgba(4,4,19,0.55)]";
const NAME_COL =
  "font-sf flex min-w-0 flex-1 flex-col items-start text-base font-bold leading-5 text-[rgba(3,3,6,0.88)]";
const BODY_COL =
  "font-sf flex min-w-0 flex-1 flex-col items-start text-base leading-5 text-[rgba(3,3,6,0.88)]";
const COL_LINK =
  "font-sf flex w-[80px] shrink-0 flex-col items-start justify-center";
const COL_LINK_ACTIONS = `${COL_LINK} items-center justify-end`;
const COPY_ICON_BUTTON =
  "inline-flex min-h-8 min-w-8 max-w-8 items-center justify-center rounded-lg bg-transparent p-1 transition-colors hover:bg-[rgba(0,0,0,0.05)] disabled:opacity-50";

function scoreColor(avg: number | null) {
  if (!avg) return "#8F90A6";
  if (avg >= 8) return "#05A660";
  if (avg >= 5) return "#E57A00";
  return "#E53535";
}

function SortableHeader({
  label,
  columnKey,
  sortKey,
  onSort,
}: {
  label: string;
  columnKey: SortKey;
  sortKey: SortKey | null;
  onSort: () => void;
}) {
  const active = sortKey === columnKey;

  return (
    <button
      type="button"
      onClick={onSort}
      className="font-sf group inline-flex items-center gap-1 text-xs font-normal leading-4 text-[rgba(4,4,19,0.55)] transition-colors hover:text-[rgba(3,3,6,0.88)]"
    >
      {label}
      <IconChevronDown
        className={`shrink-0 transition-colors group-hover:text-[rgba(3,3,6,0.88)] ${
          active ? "rotate-180 text-[rgba(3,3,6,0.88)]" : "text-[rgba(4,4,19,0.55)]"
        }`}
      />
    </button>
  );
}

function ScoreCell({ value }: { value: number | null }) {
  return (
    <span style={{ color: scoreColor(value), fontWeight: 600 }}>
      {value ? value.toFixed(1) : "—"}
    </span>
  );
}

function getAverageValue(
  designer: QuestionnaireOverviewDesigner,
  sortKey: Exclude<SortKey, "role" | "responses">
) {
  switch (sortKey) {
    case "mentorship":
      return designer.mentorshipAverage;
    case "processes":
      return designer.processesAverage;
    case "communication":
      return designer.communicationAverage;
  }
}

export function QuestionnaireList({
  designers,
}: {
  designers: QuestionnaireOverviewDesigner[];
}) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [pendingDesignerId, setPendingDesignerId] = useState<string | null>(null);
  const [copiedDesignerId, setCopiedDesignerId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list =
      roleFilter === "all"
        ? designers
        : designers.filter((designer) => designer.role === roleFilter);

    if (!sortKey) return list;

    return [...list].sort((a, b) => {
      if (sortKey === "role") {
        return ROLE_ORDER[b.role] - ROLE_ORDER[a.role];
      }

      if (sortKey === "responses") {
        return b.responseCount - a.responseCount;
      }

      const valueA = getAverageValue(a, sortKey) ?? -1;
      const valueB = getAverageValue(b, sortKey) ?? -1;
      return valueB - valueA;
    });
  }, [designers, roleFilter, sortKey]);

  function toggleSort(key: SortKey) {
    setSortKey((current) => (current === key ? null : key));
  }

  async function handleCopy(designerId: string) {
    setCopyError(null);
    setPendingDesignerId(designerId);

    try {
      const url = await generateQuestionnaireLink(designerId);
      await navigator.clipboard.writeText(url);
      setCopiedDesignerId(designerId);
      window.setTimeout(() => {
        setCopiedDesignerId((current) => (current === designerId ? null : current));
      }, 2000);
    } catch (error) {
      setCopyError(
        error instanceof Error ? error.message : "Не удалось скопировать ссылку"
      );
    } finally {
      setPendingDesignerId(null);
    }
  }

  return (
    <>
      <div className="w-full self-stretch border-b border-[#DCDCDD]">
        <nav className="flex flex-wrap items-center gap-5">
          {FILTER_OPTIONS.map((option) => {
            const active = roleFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRoleFilter(option.value)}
                className={`relative -mb-px flex h-10 items-center border-b-2 text-[18px] font-normal leading-[22px] transition-colors ${
                  active
                    ? "border-[#E53535] text-[#0F0F0F]"
                    : "border-transparent text-[rgba(60,60,67,0.66)] hover:text-[#0F0F0F]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </nav>
      </div>

      {copyError ? (
        <p className="mt-6 text-sm text-[#E53535]">{copyError}</p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="mt-6 text-base leading-6 text-[rgba(60,60,67,0.66)]">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : (
        <div className="mt-6 flex w-full min-w-[1180px] flex-col items-start gap-2 self-stretch overflow-x-auto p-0">
          <div className={TABLE_HEADER_ROW} role="row">
            <div className={HEADER_COL} role="columnheader">
              ФИО
            </div>
            <div className={HEADER_COL} role="columnheader">
              <SortableHeader
                label="Позиция"
                columnKey="role"
                sortKey={sortKey}
                onSort={() => toggleSort("role")}
              />
            </div>
            <div className={HEADER_COL} role="columnheader">
              Направление
            </div>
            <div className={HEADER_COL} role="columnheader">
              <SortableHeader
                label="Ответов"
                columnKey="responses"
                sortKey={sortKey}
                onSort={() => toggleSort("responses")}
              />
            </div>
            <div className={HEADER_COL} role="columnheader">
              <SortableHeader
                label="Менторство"
                columnKey="mentorship"
                sortKey={sortKey}
                onSort={() => toggleSort("mentorship")}
              />
            </div>
            <div className={HEADER_COL} role="columnheader">
              <SortableHeader
                label="Процессы"
                columnKey="processes"
                sortKey={sortKey}
                onSort={() => toggleSort("processes")}
              />
            </div>
            <div className={HEADER_COL} role="columnheader">
              <SortableHeader
                label="Коммуникация"
                columnKey="communication"
                sortKey={sortKey}
                onSort={() => toggleSort("communication")}
              />
            </div>
            <div
              className={`${COL_LINK} text-xs font-normal leading-4 text-[rgba(4,4,19,0.55)]`}
              role="columnheader"
            >
              Ссылка
            </div>
          </div>

          {filtered.map((designer) => (
            <div key={designer.id} className={TABLE_ROW} role="row">
              <div className={NAME_COL}>
                <Link
                  href={`/designers/${designer.id}`}
                  className="transition-colors hover:text-[#E53535]"
                >
                  {designer.name}
                </Link>
              </div>
              <div className={BODY_COL}>{ROLE_LABELS[designer.role]}</div>
              <div className={`${BODY_COL} truncate`}>{designer.direction}</div>
              <div className={`${BODY_COL} tabular-nums`}>
                {designer.responseCount}
              </div>
              <div className={`${BODY_COL} tabular-nums`}>
                <ScoreCell value={designer.mentorshipAverage} />
              </div>
              <div className={`${BODY_COL} tabular-nums`}>
                <ScoreCell value={designer.processesAverage} />
              </div>
              <div className={`${BODY_COL} tabular-nums`}>
                <ScoreCell value={designer.communicationAverage} />
              </div>
              <div className={COL_LINK_ACTIONS}>
                <button
                  type="button"
                  disabled={pendingDesignerId === designer.id}
                  onClick={() => void handleCopy(designer.id)}
                  className={COPY_ICON_BUTTON}
                  title={
                    copiedDesignerId === designer.id
                      ? "Скопировано!"
                      : "Скопировать ссылку"
                  }
                  aria-label={
                    copiedDesignerId === designer.id
                      ? "Ссылка скопирована"
                      : pendingDesignerId === designer.id
                        ? "Готовим ссылку"
                        : `Скопировать ссылку для ${designer.name}`
                  }
                >
                  <Image
                    src="/icons/copy.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
