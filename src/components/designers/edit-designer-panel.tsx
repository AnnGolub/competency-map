"use client";

import { useState } from "react";
import { DesignerFormModal } from "@/components/designers/designer-form-modal";
import type { Designer } from "@/lib/competency-utils";

export function EditDesignerPanel({ designer }: { designer: Designer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-app-border bg-app-surface px-4 py-2 text-sm text-app-muted transition-colors hover:border-app-muted hover:text-white"
      >
        Изменить
      </button>

      <DesignerFormModal
        open={isOpen}
        title="Редактировать дизайнера"
        designer={designer}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
