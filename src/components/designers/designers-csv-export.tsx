"use client";

import type {
  CompetencyExportColumn,
  DesignerWithAverage,
} from "@/lib/data/queries";
import { ROLE_LABELS } from "@/lib/competency-utils";

function csvCell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatScoreValue(v: number | null): string {
  if (v === null) return "";
  return v.toFixed(1);
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function DesignersCsvExport({
  designers,
  competencyColumns,
}: {
  designers: DesignerWithAverage[];
  competencyColumns: CompetencyExportColumn[];
}) {
  function download() {
    const headers = [
      "Имя",
      "Роль",
      "Направление",
      ...competencyColumns.map((c) => csvCell(c.title)),
      "Дата последнего ревью",
    ];
    const rows = designers.map((d) =>
      [
        csvCell(d.name),
        csvCell(ROLE_LABELS[d.role]),
        csvCell(d.direction),
        ...competencyColumns.map((c) =>
          csvCell(formatScoreValue(d.competencyScoresById[c.id] ?? null))
        ),
        csvCell(formatDate(d.lastReviewedAt)),
      ].join(",")
    );
    const csv = `\uFEFF${[headers.join(","), ...rows].join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `designers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex h-8 items-center rounded-lg bg-app-accent px-4 py-1.5 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover"
    >
      Экспорт в CSV
    </button>
  );
}
