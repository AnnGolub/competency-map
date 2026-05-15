"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DesignerWithAverage } from "@/lib/data/queries";
import { formatScore, ROLE_LABELS } from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type RoleFilter = "all" | DesignerRole;

export function DesignersList({
  designers,
}: {
  designers: DesignerWithAverage[];
}) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const filtered = useMemo(() => {
    if (roleFilter === "all") return designers;
    return designers.filter((d) => d.role === roleFilter);
  }, [designers, roleFilter]);

  return (
    <>
      <div className="mb-6 flex gap-2">
        {(
          [
            { value: "all" as const, label: "Все" },
            { value: "senior" as const, label: "Senior" },
            { value: "lead" as const, label: "Lead" },
          ] as const
        ).map((opt) => (
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

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Нет дизайнеров по выбранному фильтру.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((designer) => (
            <li key={designer.id}>
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
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
