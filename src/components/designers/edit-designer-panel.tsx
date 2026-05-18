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
        className="rounded-lg border border-app-border bg-app-surface px-4 py-2 text-sm text-app-muted transition-colors hover:border-app-muted hover:text-white"
      >
        Изменить
      </button>
    );
  }

  return (
    <div className="mt-6 max-w-lg">
      <DesignerForm
        theme="dark"
        designer={designer}
        onCancel={() => setIsOpen(false)}
        onSaved={() => setIsOpen(false)}
      />
    </div>
  );
}
