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

const TABLE_ROW =
  "flex w-full items-center gap-4 self-stretch rounded-xl bg-[#F2F3F5] px-6 py-4";
const TABLE_HEADER_ROW =
  "flex w-full items-start gap-4 self-stretch rounded-xl bg-[#F2F3F5] px-6 py-4";
const HEADER_COL =
  "font-sf flex min-w-0 flex-1 flex-col items-start text-xs font-normal leading-4 text-[rgba(4,4,19,0.55)]";
const NAME_COL =
  "font-sf flex min-w-0 flex-1 flex-col items-start gap-4 text-base font-bold leading-5 text-[rgba(3,3,6,0.88)]";
const BODY_COL =
  "font-sf flex min-w-0 flex-1 flex-col items-start text-base leading-5 text-[rgba(3,3,6,0.88)]";
const COL_ACTIONS = "flex w-[80px] shrink-0 items-center justify-end";
const ACTION_BUTTON =
  "inline-flex min-h-8 min-w-8 max-w-8 items-center justify-center rounded-lg bg-transparent p-1 text-[rgba(60,60,67,0.66)] transition-colors hover:bg-[rgba(0,0,0,0.05)]";

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
      <div className="w-full self-stretch border-b border-[#DCDCDD]">
        <nav className="flex flex-wrap items-center gap-5">
          {FILTER_OPTIONS.map((opt) => {
            const active = roleFilter === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRoleFilter(opt.value)}
                className={`relative -mb-px flex h-10 items-center border-b-2 text-[18px] font-normal leading-[22px] transition-colors ${
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
      </div>

      {filtered.length === 0 && !formModalOpen ? (
        <p className="mt-6 text-base leading-6 text-[rgba(60,60,67,0.66)]">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-6 flex w-full min-w-[880px] flex-col items-start gap-2 self-stretch overflow-x-auto p-0">
          <div className={TABLE_HEADER_ROW} role="row">
            <div className={HEADER_COL} role="columnheader">
              ФИО
            </div>
            <div className={HEADER_COL} role="columnheader">
              <SortableHeader
                label="Позиция"
                columnKey="role"
                sortKey={sortKey}
                onSort={toggleRoleSort}
              />
            </div>
            <div className={HEADER_COL} role="columnheader">
              Направление
            </div>
            <div className={HEADER_COL} role="columnheader">
              <SortableHeader
                label="Средний балл"
                columnKey="score"
                sortKey={sortKey}
                onSort={toggleScoreSort}
              />
            </div>
            <div className={HEADER_COL} role="columnheader">
              Статус
            </div>
            <div className={COL_ACTIONS} role="columnheader" aria-label="Действия" />
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
                {formatScore(designer.averageScore)}
              </div>
              <div className={BODY_COL}>
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
              </div>
              <div className={COL_ACTIONS}>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    title="Изменить"
                    aria-label={`Изменить ${designer.name}`}
                    onClick={() => setEditingDesigner(designer)}
                    className={ACTION_BUTTON}
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
                    className={ACTION_BUTTON}
                  >
                    <IconDesignerDelete className="text-[rgba(60,60,67,0.66)]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
