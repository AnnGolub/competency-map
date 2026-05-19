"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteDesigner } from "@/app/actions/designer";
import { DesignerForm } from "@/components/designers/designer-form";
import {
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@/components/ui/tabler-icons";
import type { DesignerWithAverage } from "@/lib/data/queries";
import {
  DESIGNER_ROLES,
  formatScore,
  ROLE_LABELS,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type RoleFilter = "all" | DesignerRole;
type SortKey = "role" | "score";
type SortDir = "asc" | "desc";

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

export function DesignersList({
  designers,
}: {
  designers: DesignerWithAverage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editingDesigner, setEditingDesigner] =
    useState<DesignerWithAverage | null>(null);
  const [deletingDesigner, setDeletingDesigner] =
    useState<DesignerWithAverage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let list =
      roleFilter === "all"
        ? designers
        : designers.filter((d) => d.role === roleFilter);

    if (sortKey) {
      list = [...list].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "role") {
          cmp = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
        } else {
          const sa = a.averageScore ?? -1;
          const sb = b.averageScore ?? -1;
          cmp = sa - sb;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [designers, roleFilter, sortKey, sortDir]);

  const formModalOpen = isAddModalOpen || editingDesigner !== null;

  useEffect(() => {
    if (!formModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsAddModalOpen(false);
        setEditingDesigner(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formModalOpen]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Позиция: сначала Lead → Junior; балл: сначала выше.
      setSortDir("desc");
    }
  }

  function handleConfirmDelete() {
    if (!deletingDesigner) return;
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteDesigner(deletingDesigner.id);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      setDeletingDesigner(null);
      router.refresh();
    });
  }

  function closeFormModal() {
    setIsAddModalOpen(false);
    setEditingDesigner(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-app-border">
        <nav className="flex flex-wrap items-end gap-8">
          {FILTER_OPTIONS.map((opt) => {
            const active = roleFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRoleFilter(opt.value)}
                className={`-mb-px pb-3.5 text-[15px] font-medium leading-5 transition-colors ${
                  active
                    ? "border-b-2 border-white text-white"
                    : "border-b-2 border-transparent text-app-muted hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <Link
            href="/designers/questionnaire"
            className="-mb-px border-b-2 border-transparent pb-3.5 text-[15px] font-medium leading-5 text-app-muted transition-colors hover:text-white"
          >
            Опросник
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="mb-3 inline-flex shrink-0 items-center gap-2 rounded-lg bg-app-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-accent-hover"
        >
          <IconPlus className="text-white" />
          Добавить дизайнера
        </button>
      </div>

      {filtered.length === 0 && !formModalOpen ? (
        <p className="mt-12 text-[15px] leading-6 text-app-muted">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-app-border text-[13px] font-medium leading-4 tracking-wide text-app-muted">
                <th className="pb-4 pr-6 font-medium normal-case text-white/70">
                  ФИО
                </th>
                <th className="pb-4 pr-6 font-medium normal-case text-white/70">
                  <button
                    type="button"
                    onClick={() => toggleSort("role")}
                    className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
                  >
                    Позиция
                    <IconChevronDown
                      className={
                        sortKey === "role" && sortDir === "asc"
                          ? "rotate-180 text-white"
                          : sortKey === "role"
                            ? "text-white"
                            : "opacity-50"
                      }
                    />
                  </button>
                </th>
                <th className="pb-4 pr-6 font-medium normal-case text-white/70">
                  Направление
                </th>
                <th className="pb-4 pr-6 font-medium normal-case text-white/70">
                  <button
                    type="button"
                    onClick={() => toggleSort("score")}
                    className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
                  >
                    Средний балл
                    <IconChevronDown
                      className={
                        sortKey === "score" && sortDir === "asc"
                          ? "rotate-180 text-white"
                          : sortKey === "score"
                            ? "text-white"
                            : "opacity-50"
                      }
                    />
                  </button>
                </th>
                <th className="pb-4 w-24" aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((designer) => (
                <tr
                  key={designer.id}
                  className="border-b border-app-border/80 text-[15px] leading-5"
                >
                  <td className="py-5 pr-6">
                    <Link
                      href={`/designers/${designer.id}`}
                      className="font-medium text-white transition-colors hover:text-app-accent"
                    >
                      {designer.name}
                    </Link>
                  </td>
                  <td className="py-5 pr-6 text-white/90">
                    {ROLE_LABELS[designer.role]}
                  </td>
                  <td className="max-w-[220px] truncate py-5 pr-6 text-white/85">
                    {designer.direction}
                  </td>
                  <td className="py-5 pr-6 tabular-nums text-white/90">
                    {formatScore(designer.averageScore)}
                  </td>
                  <td className="py-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Изменить"
                        aria-label={`Изменить ${designer.name}`}
                        onClick={() => setEditingDesigner(designer)}
                        className="rounded p-1.5 text-app-muted transition-colors hover:bg-app-surface hover:text-white"
                      >
                        <IconPencil />
                      </button>
                      <button
                        type="button"
                        title="Удалить"
                        aria-label={`Удалить ${designer.name}`}
                        onClick={() => {
                          setDeleteError(null);
                          setDeletingDesigner(designer);
                        }}
                        className="rounded p-1.5 text-app-muted transition-colors hover:bg-app-surface hover:text-white"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {formModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="designer-form-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFormModal();
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-[440px] overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-app-border px-6 py-4">
              <h2
                id="designer-form-modal-title"
                className="text-lg font-semibold tracking-tight text-white"
              >
                {editingDesigner
                  ? "Редактировать дизайнера"
                  : "Добавить дизайнера"}
              </h2>
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg p-2 text-app-muted transition-colors hover:bg-app-canvas hover:text-white"
                aria-label="Закрыть"
              >
                <IconX />
              </button>
            </div>
            <div className="max-h-[calc(90vh-4.5rem)] overflow-y-auto px-6 py-5">
              <DesignerForm
                key={editingDesigner?.id ?? "new"}
                theme="dark"
                variant="modal"
                designer={editingDesigner ?? undefined}
                onCancel={closeFormModal}
              />
            </div>
          </div>
        </div>
      ) : null}

      {deletingDesigner ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-app-border bg-app-surface p-6 text-white shadow-xl">
            <p id="delete-dialog-title" className="font-medium">
              Удалить {deletingDesigner.name}?
            </p>
            {deleteError ? (
              <p className="mt-2 text-sm text-red-400">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setDeletingDesigner(null);
                  setDeleteError(null);
                }}
                className="rounded-lg border border-app-border px-4 py-2 text-sm text-app-muted transition-colors hover:text-white"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
              >
                {isPending ? "Удаление…" : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
