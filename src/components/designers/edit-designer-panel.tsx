"use client";

import { useState } from "react";
import { DesignerForm } from "@/components/designers/designer-form";
import type { Designer } from "@/lib/competency-utils";

export function EditDesignerPanel({ designer }: { designer: Designer }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border-[0.5px] border-neutral-200 px-4 py-1.5 text-sm text-neutral-600 transition-colors hover:border-neutral-400"
      >
        Изменить
      </button>
    );
  }

  return (
    <div className="mt-6">
      <DesignerForm
        designer={designer}
        onCancel={() => setIsOpen(false)}
        onSaved={() => setIsOpen(false)}
      />
    </div>
  );
}
