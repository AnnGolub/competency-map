"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteDesigner } from "@/app/actions/designer";
import { DesignerForm } from "@/components/designers/designer-form";
import {
  IconDesignerAdd,
  IconDesignerDelete,
  IconDesignerEdit,
} from "@/components/designers/designers-icons";
import { IconChevronDown, IconX } from "@/components/ui/tabler-icons";
import type { DesignerWithAverage } from "@/lib/data/queries";
import {
  DESIGNER_ROLES,
  formatScore,
  ROLE_LABELS,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type RoleFilter = "all" | DesignerRole;
type SortKey = "role" | "score";

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

export function DesignersList({
  designers,
}: {
  designers: DesignerWithAverage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
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

    if (sortKey === "role") {
      list = [...list].sort(
        (a, b) => ROLE_ORDER[b.role] - ROLE_ORDER[a.role]
      );
    } else if (sortKey === "score") {
      list = [...list].sort((a, b) => {
        const sa = a.averageScore ?? -1;
        const sb = b.averageScore ?? -1;
        return sb - sa;
      });
    }

    return list;
  }, [designers, roleFilter, sortKey]);

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

  function toggleRoleSort() {
    setSortKey((key) => (key === "role" ? null : "role"));
  }

  function toggleScoreSort() {
    setSortKey((key) => (key === "score" ? null : "score"));
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
      <div className="flex items-center justify-between gap-4">
        <nav className="flex flex-wrap items-center gap-5">
          {FILTER_OPTIONS.map((opt) => {
            const active = roleFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRoleFilter(opt.value)}
                className={`border-b-2 pb-1 text-base font-normal leading-[22px] transition-colors ${
                  active
                    ? "border-white text-white"
                    : "border-transparent text-app-muted hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 bg-transparent px-0 text-base font-semibold leading-6 text-app-accent transition-opacity hover:opacity-80"
        >
          <IconDesignerAdd className="shrink-0 text-app-accent" />
          Добавить дизайнера
        </button>
      </div>

      {filtered.length === 0 && !formModalOpen ? (
        <p className="mt-6 text-base leading-6 text-app-muted">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-app-sidebar-border text-xs font-normal leading-4 text-app-muted">
                <th className="pb-3 pr-6 font-normal text-app-muted">ФИО</th>
                <th className="pb-3 pr-6 font-normal">
                  <SortableHeader
                    label="Позиция"
                    columnKey="role"
                    sortKey={sortKey}
                    onSort={toggleRoleSort}
                  />
                </th>
                <th className="pb-3 pr-6 font-normal text-app-muted">
                  Направление
                </th>
                <th className="pb-3 pr-6 font-normal">
                  <SortableHeader
                    label="Средний балл"
                    columnKey="score"
                    sortKey={sortKey}
                    onSort={toggleScoreSort}
                  />
                </th>
                <th className="pb-3 w-28" aria-label="Действия" />
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
                  <td className="py-3 pr-6 tabular-nums">
                    {formatScore(designer.averageScore)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Изменить"
                        aria-label={`Изменить ${designer.name}`}
                        onClick={() => setEditingDesigner(designer)}
                        className="rounded p-0.5 transition-opacity hover:opacity-80"
                      >
                        <IconDesignerEdit />
                      </button>
                      <button
                        type="button"
                        title="Удалить"
                        aria-label={`Удалить ${designer.name}`}
                        onClick={() => {
                          setDeleteError(null);
                          setDeletingDesigner(designer);
                        }}
                        className="rounded p-0.5 transition-opacity hover:opacity-80"
                      >
                        <IconDesignerDelete />
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
            className="max-h-[90vh] w-full max-w-[480px] overflow-hidden rounded-xl border border-app-sidebar-border bg-app-sidebar shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <h2
                id="designer-form-modal-title"
                className="text-lg font-bold leading-6 text-white"
              >
                {editingDesigner
                  ? "Редактировать дизайнера"
                  : "Добавить дизайнера"}
              </h2>
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg p-1 text-app-muted transition-colors hover:text-white"
                aria-label="Закрыть"
              >
                <IconX />
              </button>
            </div>
            <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-6 pb-6 pt-6">
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
          <div className="w-full max-w-sm rounded-xl border border-app-sidebar-border bg-app-sidebar p-6 text-white shadow-xl">
            <p id="delete-dialog-title" className="text-base font-bold leading-6">
              Удалить {deletingDesigner.name}?
            </p>
            {deleteError ? (
              <p className="mt-2 text-sm text-red-400">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setDeletingDesigner(null);
                  setDeleteError(null);
                }}
                className="h-10 rounded-lg border border-app-sidebar-border px-5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="h-10 rounded-lg bg-app-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
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
