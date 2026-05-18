"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveDesigner, type DesignerFormData } from "@/app/actions/designer";
import { DESIGNER_ROLES, ROLE_LABELS, type Designer } from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

type DesignerFormProps = {
  designer?: Designer;
  onCancel: () => void;
  onSaved?: () => void;
};

export function DesignerForm({ designer, onCancel, onSaved }: DesignerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(designer?.name ?? "");
  const [role, setRole] = useState<DesignerRole>(designer?.role ?? "middle");
  const [direction, setDirection] = useState(designer?.direction ?? "");
  const [email, setEmail] = useState(designer?.email ?? "");

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
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-[0.5px] border-neutral-200 p-4"
    >
      <h2 className="font-medium">
        {designer ? "Редактировать дизайнера" : "Добавить дизайнера"}
      </h2>

      {error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}

      <label className="mt-4 block">
        <span className="text-sm text-neutral-600">Имя</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border-[0.5px] border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm text-neutral-600">Роль</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as DesignerRole)}
          className="mt-1 w-full rounded-lg border-[0.5px] border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
        >
          {DESIGNER_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="text-sm text-neutral-600">Email (для входа)</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border-[0.5px] border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm text-neutral-600">Направление</span>
        <input
          required
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="mt-1 w-full rounded-lg border-[0.5px] border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </label>

      <div className="mt-6 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg border-[0.5px] border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Сохранение…" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border-[0.5px] border-neutral-200 px-4 py-2 text-sm text-neutral-600"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
