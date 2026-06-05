"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteDesigner } from "@/app/actions/designer";
import { DesignerFormModal } from "@/components/designers/designer-form-modal";
import {
  IconDesignerDelete,
  IconDesignerEdit,
} from "@/components/designers/designers-icons";
import { IconChevronDown } from "@/components/ui/tabler-icons";
import type { DesignerWithAverage } from "@/lib/data/queries";
import {
  DESIGNER_ROLES,
  formatScore,
  ROLE_LABELS,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type RoleFilter = "all" | DesignerRole;
type SortKey = "role" | "score";
type ReviewStatus = DesignerWithAverage["reviewStatus"];

const STATUS_STYLES: Record<
  ReviewStatus,
  { background: string; label: string }
> = {
  "to do": { background: "#898991", label: "TO DO" },
  "in progress": { background: "#FA9313", label: "IN PROGRESS" },
  done: { background: "#0CC44D", label: "DONE" },
};

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

const TABLE_HEADER_CELL =
  "px-6 py-4 text-left text-xs font-normal leading-4 text-[rgba(4,4,19,0.55)]";
const TABLE_BODY_CELL = "px-6 py-4 text-base leading-6 text-[rgba(3,3,6,0.88)]";

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
      className="group inline-flex items-center gap-1 font-normal text-[rgba(4,4,19,0.55)] transition-colors hover:text-[rgba(3,3,6,0.88)]"
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

export function DesignersList({
  designers,
  isAddModalOpen = false,
  onAddModalOpenChange,
}: {
  designers: DesignerWithAverage[];
  isAddModalOpen?: boolean;
  onAddModalOpenChange?: (open: boolean) => void;
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
    onAddModalOpenChange?.(false);
    setEditingDesigner(null);
  }

  return (
    <>
      <nav className="flex flex-wrap items-center gap-5">
        {FILTER_OPTIONS.map((opt) => {
          const active = roleFilter === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoleFilter(opt.value)}
              className={`flex h-10 items-center border-b-2 text-[18px] font-normal leading-[22px] transition-colors ${
                active
                  ? "border-[#E53535] text-[#0F0F0F]"
                  : "border-transparent text-[rgba(60,60,67,0.66)] hover:text-[#0F0F0F]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </nav>

      {filtered.length === 0 && !formModalOpen ? (
        <p className="mt-6 text-base leading-6 text-[rgba(60,60,67,0.66)]">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#EDEEF0]">
                <th className={TABLE_HEADER_CELL}>ФИО</th>
                <th className={TABLE_HEADER_CELL}>
                  <SortableHeader
                    label="Позиция"
                    columnKey="role"
                    sortKey={sortKey}
                    onSort={toggleRoleSort}
                  />
                </th>
                <th className={TABLE_HEADER_CELL}>Направление</th>
                <th className={TABLE_HEADER_CELL}>
                  <SortableHeader
                    label="Средний балл"
                    columnKey="score"
                    sortKey={sortKey}
                    onSort={toggleScoreSort}
                  />
                </th>
                <th className={TABLE_HEADER_CELL}>Статус</th>
                <th className={`${TABLE_HEADER_CELL} w-28`} aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((designer) => (
                <tr
                  key={designer.id}
                  className="border-b border-[#EDEEF0]"
                >
                  <td className={TABLE_BODY_CELL}>
                    <Link
                      href={`/designers/${designer.id}`}
                      className="text-base font-bold leading-6 text-[rgba(3,3,6,0.88)] transition-colors hover:text-[#E53535]"
                    >
                      {designer.name}
                    </Link>
                  </td>
                  <td className={TABLE_BODY_CELL}>{ROLE_LABELS[designer.role]}</td>
                  <td className={`${TABLE_BODY_CELL} max-w-[220px] truncate`}>
                    {designer.direction}
                  </td>
                  <td className={`${TABLE_BODY_CELL} tabular-nums`}>
                    {formatScore(designer.averageScore)}
                  </td>
                  <td className={TABLE_BODY_CELL}>
                    <span
                      style={{
                        background: STATUS_STYLES[designer.reviewStatus].background,
                        color: "rgba(255, 255, 255, 0.94)",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {STATUS_STYLES[designer.reviewStatus].label}
                    </span>
                  </td>
                  <td className={TABLE_BODY_CELL}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Изменить"
                        aria-label={`Изменить ${designer.name}`}
                        onClick={() => setEditingDesigner(designer)}
                        className="rounded p-0.5 text-[rgba(60,60,67,0.66)] transition-opacity hover:opacity-80"
                      >
                        <IconDesignerEdit className="text-[rgba(60,60,67,0.66)]" />
                      </button>
                      <button
                        type="button"
                        title="Удалить"
                        aria-label={`Удалить ${designer.name}`}
                        onClick={() => {
                          setDeleteError(null);
                          setDeletingDesigner(designer);
                        }}
                        className="rounded p-0.5 text-[rgba(60,60,67,0.66)] transition-opacity hover:opacity-80"
                      >
                        <IconDesignerDelete className="text-[rgba(60,60,67,0.66)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <DesignerFormModal
        open={formModalOpen}
        title={
          editingDesigner ? "Редактировать дизайнера" : "Добавить дизайнера"
        }
        designer={editingDesigner ?? undefined}
        onClose={closeFormModal}
      />

      {deletingDesigner ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-[#EDEEF0] bg-white p-6 text-[rgba(3,3,6,0.88)] shadow-xl">
            <p id="delete-dialog-title" className="text-base font-bold leading-6">
              Удалить {deletingDesigner.name}?
            </p>
            {deleteError ? (
              <p className="mt-2 text-sm text-[#E53535]">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setDeletingDesigner(null);
                  setDeleteError(null);
                }}
                className="h-10 rounded-lg border border-[#EDEEF0] px-5 text-sm font-semibold text-[rgba(60,60,67,0.66)] transition-colors hover:text-[rgba(3,3,6,0.88)]"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="h-10 rounded-lg bg-[#E53535] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#c42d2d] disabled:opacity-50"
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
