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

const MODAL_FIELD_EMPTY =
  "font-sf w-full rounded-xl border-0 bg-[#F2F3F5] px-4 py-3.5 text-base leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)] outline-none placeholder:text-[rgba(4,4,19,0.55)] placeholder:tracking-[-0.24px]";

const MODAL_FIELD_LABEL =
  "font-sf text-sm leading-5 tracking-[-0.08px] text-[rgba(4,4,19,0.55)]";

const MODAL_FIELD_VALUE =
  "font-sf w-full border-0 bg-transparent p-0 text-base leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)] outline-none";

function ModalTextField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const filled = value.length > 0;

  if (!filled) {
    return (
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={MODAL_FIELD_EMPTY}
      />
    );
  }

  return (
    <label className="flex w-full flex-col rounded-xl bg-[#F2F3F5] px-4 py-3.5">
      <span className={MODAL_FIELD_LABEL}>{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={MODAL_FIELD_VALUE}
      />
    </label>
  );
}

function ModalSelect({
  label,
  value,
  onChange,
  placeholder,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  children: ReactNode;
}) {
  const filled = value !== "";

  return (
    <div className="relative w-full">
      <div
        className={`rounded-xl bg-[#F2F3F5] px-4 ${
          filled ? "flex flex-col py-3.5" : "py-3.5"
        }`}
      >
        {filled ? <span className={MODAL_FIELD_LABEL}>{label}</span> : null}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`font-sf w-full appearance-none border-0 bg-transparent pr-8 outline-none ${
            filled
              ? "text-base leading-6 tracking-[-0.24px] text-[rgba(3,3,6,0.88)]"
              : "text-base leading-6 tracking-[-0.24px] text-[rgba(4,4,19,0.55)]"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {children}
        </select>
      </div>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(4,4,19,0.55)]">
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
    ? "font-sf inline-flex min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[#212124] px-5 py-1 text-base font-medium leading-6 text-[rgba(255,255,255,0.94)] transition-opacity hover:opacity-90 disabled:opacity-50"
    : isDark
      ? "rounded-lg bg-app-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-accent-hover disabled:opacity-50"
      : "rounded-lg border-[0.5px] border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50";

  const secondaryBtn = isModal
    ? "font-sf inline-flex min-h-12 min-w-[104px] items-center justify-center rounded-[10px] bg-[rgba(15,25,55,0.10)] px-5 py-1 text-base font-medium leading-6 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-opacity hover:opacity-90"
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
      className={isModal ? "" : `${shell} ${isDark ? "text-white" : ""}`}
    >
      {!isModal ? (
        <h2 className="font-medium">
          {designer ? "Редактировать дизайнера" : "Добавить дизайнера"}
        </h2>
      ) : null}

      {error && !isModal ? (
        <p className={`text-sm ${errorCls} mt-3`}>{error}</p>
      ) : null}

      <div
        className={
          isModal
            ? "flex flex-col gap-6 px-7 pt-7"
            : `space-y-4 ${!isModal ? "mt-4" : ""}`
        }
      >
        {error && isModal ? (
          <p className="text-sm text-[#E53535]">{error}</p>
        ) : null}

        {isModal ? (
          <ModalTextField
            label="Имя"
            required
            value={name}
            onChange={setName}
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
            label="Позиция"
            value={role}
            onChange={(v) => setRole(v as DesignerRole)}
            placeholder="Позиция"
          >
            {DESIGNER_ROLES.map((r) => (
              <option key={r} value={r}>
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
            label="Направление"
            value={direction}
            onChange={setDirection}
            placeholder="Направление"
          >
            {directionSelectOptions.map((opt) => (
              <option key={opt} value={opt}>
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
          isModal
            ? "flex gap-4 px-7 pb-10 pt-6"
            : "mt-6 flex gap-2"
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
