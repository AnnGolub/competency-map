"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveDesigner, type DesignerFormData } from "@/app/actions/designer";
import {
  DESIGNER_ROLES,
  ROLE_LABELS,
  type Designer,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type DesignerFormProps = {
  designer?: Designer;
  theme?: "light" | "dark";
  onCancel: () => void;
  onSaved?: () => void;
};

export function DesignerForm({
  designer,
  theme = "light",
  onCancel,
  onSaved,
}: DesignerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(designer?.name ?? "");
  const [role, setRole] = useState<DesignerRole>(designer?.role ?? "middle");
  const [direction, setDirection] = useState(designer?.direction ?? "");
  const [email, setEmail] = useState(designer?.email ?? "");

  const isDark = theme === "dark";
  const shell = isDark
    ? "rounded-xl border border-app-border bg-app-surface p-6 text-white"
    : "rounded-lg border-[0.5px] border-neutral-200 p-4";
  const label = isDark ? "text-sm text-app-muted" : "text-sm text-neutral-600";
  const input = isDark
    ? "mt-1 w-full rounded-lg border border-app-border bg-app-canvas px-3 py-2 text-sm text-white outline-none focus:border-app-accent"
    : "mt-1 w-full rounded-lg border-[0.5px] border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400";
  const select = isDark
    ? `${input} bg-app-canvas`
    : `${input} bg-white`;
  const primaryBtn = isDark
    ? "rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
    : "rounded-lg border-[0.5px] border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50";
  const secondaryBtn = isDark
    ? "rounded-lg border border-app-border px-4 py-2 text-sm text-app-muted transition-colors hover:text-white"
    : "rounded-lg border-[0.5px] border-neutral-200 px-4 py-2 text-sm text-neutral-600";
  const errorCls = isDark ? "text-red-400" : "text-red-700";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: DesignerFormData = {
      id: designer?.id,
      name,
      role,
      direction,
      email,
    };

    startTransition(async () => {
      const result = await saveDesigner(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved?.();
      router.refresh();
      onCancel();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={shell}>
      <h2 className="font-medium">
        {designer ? "Редактировать дизайнера" : "Добавить дизайнера"}
      </h2>

      {error ? <p className={`mt-3 text-sm ${errorCls}`}>{error}</p> : null}

      <label className="mt-4 block">
        <span className={label}>Имя</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={input}
        />
      </label>

      <label className="mt-4 block">
        <span className={label}>Роль</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as DesignerRole)}
          className={select}
        >
          {DESIGNER_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className={label}>Email (для входа)</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />
      </label>

      <label className="mt-4 block">
        <span className={label}>Направление</span>
        <input
          required
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className={input}
        />
      </label>

      <div className="mt-6 flex gap-2">
        <button type="submit" disabled={isPending} className={primaryBtn}>
          {isPending ? "Сохранение…" : "Сохранить"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Отмена
        </button>
      </div>
    </form>
  );
}
