"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveDesigner, type DesignerFormData } from "@/app/actions/designer";
import { IconSelectArrow } from "@/components/designers/designers-icons";
import { DESIGN_DIRECTION_OPTIONS } from "@/lib/design-directions";
import {
  DESIGNER_ROLES,
  ROLE_LABELS,
  type Designer,
} from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type DesignerFormProps = {
  designer?: Designer;
  theme?: "light" | "dark";
  variant?: "card" | "modal";
  onCancel: () => void;
  onSaved?: () => void;
};

function ModalSelect({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-lg border-0 bg-app-input px-3 pr-10 text-base font-normal leading-6 text-white outline-none focus:ring-1 focus:ring-app-accent [&:invalid]:text-app-placeholder"
      >
        <option value="" disabled className="text-app-placeholder">
          {placeholder}
        </option>
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
        <IconSelectArrow />
      </span>
    </div>
  );
}

export function DesignerForm({
  designer,
  theme = "light",
  variant = "card",
  onCancel,
  onSaved,
}: DesignerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(designer?.name ?? "");
  const [role, setRole] = useState<DesignerRole | "">(
    designer?.role ?? (variant === "modal" ? "" : "middle")
  );
  const [direction, setDirection] = useState(designer?.direction ?? "");
  const [email, setEmail] = useState(designer?.email ?? "");

  const isModal = variant === "modal";
  const isDark = theme === "dark";
  const showEmail = !isModal;

  const shell = isModal
    ? ""
    : isDark
      ? "rounded-xl border border-app-border bg-app-surface p-6 text-white"
      : "rounded-lg border-[0.5px] border-neutral-200 p-4";

  const label = isDark ? "text-sm text-app-muted" : "text-sm text-neutral-600";

  const input = isModal
    ? "h-12 w-full rounded-lg border-0 bg-app-input px-3 text-base font-normal leading-6 text-white placeholder:text-app-placeholder outline-none focus:ring-1 focus:ring-app-accent"
    : isDark
      ? "mt-1 w-full rounded-lg border border-app-border bg-app-canvas px-3 py-2.5 text-sm text-white outline-none focus:border-app-accent"
      : "mt-1 w-full rounded-lg border-[0.5px] border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400";

  const select = isDark
    ? `${input} bg-app-canvas`
    : `${input} bg-white`;

  const primaryBtn = isModal
    ? "h-10 rounded-lg bg-app-accent px-6 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
    : isDark
      ? "rounded-lg bg-app-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
      : "rounded-lg border-[0.5px] border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50";

  const secondaryBtn = isModal
    ? "h-10 rounded-lg bg-app-input px-6 text-sm font-semibold leading-5 text-white transition-colors hover:bg-app-input/80"
    : isDark
      ? "rounded-lg border border-app-border px-4 py-2.5 text-sm text-app-muted transition-colors hover:text-white"
      : "rounded-lg border-[0.5px] border-neutral-200 px-4 py-2.5 text-sm text-neutral-600";

  const errorCls = isDark ? "text-red-400" : "text-red-700";

  const directionSelectOptions = useMemo(() => {
    const opts: string[] = [...DESIGN_DIRECTION_OPTIONS];
    if (designer?.direction && !opts.includes(designer.direction)) {
      opts.push(designer.direction);
    }
    return opts;
  }, [designer?.direction]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Выберите позицию");
      return;
    }

    const payload: DesignerFormData = {
      id: designer?.id,
      name,
      role,
      direction,
    };

    if (showEmail) {
      payload.email = email;
    } else if (designer?.id) {
      payload.email = designer.email;
    }

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
    <form
      onSubmit={handleSubmit}
      className={isModal ? "text-white" : `${shell} ${isDark ? "text-white" : ""}`}
    >
      {!isModal ? (
        <h2 className="font-medium">
          {designer ? "Редактировать дизайнера" : "Добавить дизайнера"}
        </h2>
      ) : null}

      {error ? (
        <p className={`text-sm ${errorCls} ${!isModal ? "mt-3" : "mb-4"}`}>
          {error}
        </p>
      ) : null}

      <div className={isModal ? "space-y-6" : `space-y-4 ${!isModal ? "mt-4" : ""}`}>
        {isModal ? (
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
            placeholder="Имя"
          />
        ) : (
          <label className="block">
            <span className={label}>Имя</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={input}
            />
          </label>
        )}

        {isModal ? (
          <ModalSelect
            value={role}
            onChange={(v) => setRole(v as DesignerRole)}
            placeholder="Позиция"
          >
            {DESIGNER_ROLES.map((r) => (
              <option key={r} value={r} className="bg-app-input text-white">
                {ROLE_LABELS[r]}
              </option>
            ))}
          </ModalSelect>
        ) : (
          <label className="block">
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
        )}

        {showEmail ? (
          <label className="block">
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
        ) : null}

        {isModal ? (
          <ModalSelect
            value={direction}
            onChange={setDirection}
            placeholder="Направление"
          >
            {directionSelectOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-app-input text-white">
                {opt}
              </option>
            ))}
          </ModalSelect>
        ) : (
          <label className="block">
            <span className={label}>Направление</span>
            <select
              required
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className={select}
            >
              <option value="" disabled>
                Выберите направление
              </option>
              {directionSelectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div
        className={
          isModal ? "mt-10 flex justify-start gap-3" : "mt-6 flex gap-2"
        }
      >
        <button type="submit" disabled={isPending} className={primaryBtn}>
          {isPending ? "Сохранение…" : "Сохранить"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          {isModal ? "Отменить" : "Отмена"}
        </button>
      </div>
    </form>
  );
}
