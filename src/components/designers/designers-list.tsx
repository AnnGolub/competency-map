"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteDesigner } from "@/app/actions/designer";
import { DesignerForm } from "@/components/designers/designer-form";
import {
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@/components/ui/tabler-icons";
import type { DesignerWithAverage } from "@/lib/data/queries";
import {
  DESIGNER_ROLES,
  formatScore,
  ROLE_LABELS,
  type Designer,
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
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [deletingDesigner, setDeletingDesigner] =
    useState<DesignerWithAverage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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

  const showForm = isAdding || editingDesigner !== null;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
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

  return (
    <>
      <nav className="flex gap-8 border-b border-app-border">
        {FILTER_OPTIONS.map((opt) => {
          const active = roleFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoleFilter(opt.value)}
              className={`-mb-px pb-3 text-sm font-medium transition-colors ${
                active
                  ? "border-b-2 border-white text-white"
                  : "border-b-2 border-transparent text-app-muted hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </nav>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-app-accent transition-colors hover:text-app-accent-hover"
        >
          <IconPlus />
          Добавить дизайнера
        </button>
      ) : null}

      {showForm ? (
        <div className="mt-6 max-w-lg">
          <DesignerForm
            theme="dark"
            designer={editingDesigner ?? undefined}
            onCancel={() => {
              setIsAdding(false);
              setEditingDesigner(null);
            }}
            onSaved={() => {
              setIsAdding(false);
              setEditingDesigner(null);
            }}
          />
        </div>
      ) : null}

      {filtered.length === 0 && !showForm ? (
        <p className="mt-10 text-sm text-app-muted">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-app-border text-xs font-medium uppercase tracking-wide text-app-muted">
                <th className="pb-4 pr-4 font-medium normal-case">ФИО</th>
                <th className="pb-4 pr-4 font-medium normal-case">
                  <button
                    type="button"
                    onClick={() => toggleSort("role")}
                    className="inline-flex items-center gap-1 transition-colors hover:text-white"
                  >
                    Позиция
                    <IconChevronDown
                      className={
                        sortKey === "role" && sortDir === "desc"
                          ? "rotate-180"
                          : ""
                      }
                    />
                  </button>
                </th>
                <th className="pb-4 pr-4 font-medium normal-case">
                  <button
                    type="button"
                    onClick={() => toggleSort("score")}
                    className="inline-flex items-center gap-1 transition-colors hover:text-white"
                  >
                    Средний балл
                    <IconChevronDown
                      className={
                        sortKey === "score" && sortDir === "desc"
                          ? "rotate-180"
                          : ""
                      }
                    />
                  </button>
                </th>
                <th className="pb-4 w-20" aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((designer) => (
                <tr
                  key={designer.id}
                  className="border-b border-app-border/80 text-sm"
                >
                  <td className="py-4 pr-4">
                    <Link
                      href={`/designers/${designer.id}`}
                      className="font-medium text-white transition-colors hover:text-app-accent"
                    >
                      {designer.name}
                    </Link>
                  </td>
                  <td className="py-4 pr-4 text-white/90">
                    {ROLE_LABELS[designer.role]}
                  </td>
                  <td className="py-4 pr-4 tabular-nums text-white/90">
                    {formatScore(designer.averageScore)}
                  </td>
                  <td className="py-4">
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
