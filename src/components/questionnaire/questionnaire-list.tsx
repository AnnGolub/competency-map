"use client";

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
      className="group inline-flex items-center gap-1 font-normal text-app-muted transition-colors hover:text-white"
    >
      {label}
      <IconChevronDown
        className={`shrink-0 text-app-placeholder transition-colors group-hover:text-white ${
          active ? "rotate-180 text-app-placeholder" : ""
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
      <div className="flex items-center justify-between gap-4">
        <nav className="flex flex-wrap items-center gap-5">
          {FILTER_OPTIONS.map((option) => {
            const active = roleFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRoleFilter(option.value)}
                className={`border-b-2 pb-1 text-base font-normal leading-[22px] transition-colors ${
                  active
                    ? "border-white text-white"
                    : "border-transparent text-app-muted hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </nav>
      </div>

      {copyError ? <p className="mt-6 text-sm text-red-400">{copyError}</p> : null}

      {filtered.length === 0 ? (
        <p className="mt-6 text-base leading-6 text-app-muted">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              <tr className="border-b border-app-sidebar-border text-xs font-normal leading-4 text-app-muted">
                <th className="pb-3 pr-6 font-normal text-app-muted">ФИО</th>
                <th className="pb-3 pr-6 font-normal">
                  <SortableHeader
                    label="Позиция"
                    columnKey="role"
                    sortKey={sortKey}
                    onSort={() => toggleSort("role")}
                  />
                </th>
                <th className="pb-3 pr-6 font-normal text-app-muted">Направление</th>
                <th className="pb-3 pr-6 font-normal">
                  <SortableHeader
                    label="Ответов"
                    columnKey="responses"
                    sortKey={sortKey}
                    onSort={() => toggleSort("responses")}
                  />
                </th>
                <th className="pb-3 pr-6 font-normal">
                  <SortableHeader
                    label="Менторство"
                    columnKey="mentorship"
                    sortKey={sortKey}
                    onSort={() => toggleSort("mentorship")}
                  />
                </th>
                <th className="pb-3 pr-6 font-normal">
                  <SortableHeader
                    label="Процессы"
                    columnKey="processes"
                    sortKey={sortKey}
                    onSort={() => toggleSort("processes")}
                  />
                </th>
                <th className="pb-3 pr-6 font-normal">
                  <SortableHeader
                    label="Коммуникация"
                    columnKey="communication"
                    sortKey={sortKey}
                    onSort={() => toggleSort("communication")}
                  />
                </th>
                <th className="pb-3 font-normal text-app-muted">Ссылка</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((designer) => (
                <tr
                  key={designer.id}
                  className="border-b border-app-sidebar-border text-base leading-6 text-white/90"
                >
                  <td className="py-3 pr-6">
                    <Link
                      href={`/designers/${designer.id}`}
                      className="text-sm font-semibold leading-5 text-white transition-colors hover:text-app-accent"
                    >
                      {designer.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-6">{ROLE_LABELS[designer.role]}</td>
                  <td className="max-w-[220px] truncate py-3 pr-6">
                    {designer.direction}
                  </td>
                  <td className="py-3 pr-6 tabular-nums">{designer.responseCount}</td>
                  <td className="py-3 pr-6 tabular-nums">
                    <ScoreCell value={designer.mentorshipAverage} />
                  </td>
                  <td className="py-3 pr-6 tabular-nums">
                    <ScoreCell value={designer.processesAverage} />
                  </td>
                  <td className="py-3 pr-6 tabular-nums">
                    <ScoreCell value={designer.communicationAverage} />
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={pendingDesignerId === designer.id}
                      onClick={() => void handleCopy(designer.id)}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-app-input px-4 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white disabled:opacity-50"
                    >
                      {copiedDesignerId === designer.id
                        ? "Скопировано!"
                        : pendingDesignerId === designer.id
                          ? "Готовим..."
                          : "Скопировать"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
