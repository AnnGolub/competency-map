"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteDesigner } from "@/app/actions/designer";
import { DesignerForm } from "@/components/designers/designer-form";
import { IconPencil, IconTrash } from "@/components/ui/tabler-icons";
import type { DesignerWithAverage } from "@/lib/data/queries";
import {
  DESIGNER_ROLES,
  formatScore,
  ROLE_LABELS,
  type Designer,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type RoleFilter = "all" | DesignerRole;

const FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Все" },
  ...DESIGNER_ROLES.map((role) => ({
    value: role as RoleFilter,
    label: ROLE_LABELS[role],
  })),
];

const iconButtonClass =
  "rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700";

export function DesignersList({
  designers,
}: {
  designers: DesignerWithAverage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [deletingDesigner, setDeletingDesigner] =
    useState<DesignerWithAverage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = useMemo(() => {
    if (roleFilter === "all") return designers;
    return designers.filter((d) => d.role === roleFilter);
  }, [designers, roleFilter]);

  const showForm = isAdding || editingDesigner !== null;

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoleFilter(opt.value)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                roleFilter === opt.value
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="rounded-full border-[0.5px] border-neutral-900 px-4 py-1.5 text-sm font-medium"
          >
            Добавить
          </button>
        ) : null}
      </div>

      {showForm ? (
        <div className="mb-6">
          <DesignerForm
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

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((designer) => (
            <li key={designer.id} className="group relative">
              <Link
                href={`/designers/${designer.id}`}
                className="block rounded-lg border-[0.5px] border-neutral-200 p-4 pr-16 transition-colors hover:border-neutral-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-medium">{designer.name}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {ROLE_LABELS[designer.role]} · {designer.direction}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-neutral-400">Средний балл</p>
                    <p className="text-lg font-medium tabular-nums">
                      {formatScore(designer.averageScore)}
                    </p>
                  </div>
                </div>
              </Link>
              <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <button
                  type="button"
                  title="Изменить"
                  aria-label={`Изменить ${designer.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingDesigner(designer);
                  }}
                  className={iconButtonClass}
                >
                  <IconPencil />
                </button>
                <button
                  type="button"
                  title="Удалить"
                  aria-label={`Удалить ${designer.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteError(null);
                    setDeletingDesigner(designer);
                  }}
                  className={iconButtonClass}
                >
                  <IconTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deletingDesigner ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-lg border-[0.5px] border-neutral-200 bg-white p-5">
            <p id="delete-dialog-title" className="font-medium">
              Удалить {deletingDesigner.name}?
            </p>
            {deleteError ? (
              <p className="mt-2 text-sm text-red-700">{deleteError}</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setDeletingDesigner(null);
                  setDeleteError(null);
                }}
                className="rounded-lg border-[0.5px] border-neutral-200 px-4 py-2 text-sm text-neutral-600"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="rounded-lg border-[0.5px] border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
