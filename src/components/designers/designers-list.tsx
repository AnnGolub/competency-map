"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DesignerForm } from "@/components/designers/designer-form";
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

export function DesignersList({
  designers,
}: {
  designers: DesignerWithAverage[];
}) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = useMemo(() => {
    if (roleFilter === "all") return designers;
    return designers.filter((d) => d.role === roleFilter);
  }, [designers, roleFilter]);

  const showForm = isAdding || editingDesigner !== null;

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
            <li key={designer.id} className="relative">
              <Link
                href={`/designers/${designer.id}`}
                className="block rounded-lg border-[0.5px] border-neutral-200 p-4 transition-colors hover:border-neutral-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium">{designer.name}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {ROLE_LABELS[designer.role]} · {designer.direction}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">Средний балл</p>
                    <p className="text-lg font-medium tabular-nums">
                      {formatScore(designer.averageScore)}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingDesigner(designer);
                }}
                className="absolute right-3 top-3 z-10 text-xs text-neutral-400 hover:text-neutral-900"
              >
                Изменить
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
