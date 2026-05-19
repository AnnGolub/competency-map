"use client";

import { useEffect } from "react";
import { DesignerForm } from "@/components/designers/designer-form";
import { IconX } from "@/components/ui/tabler-icons";
import type { Designer } from "@/lib/competency-utils";

export function DesignerFormModal({
  open,
  title,
  designer,
  onClose,
}: {
  open: boolean;
  title: string;
  designer?: Designer;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="designer-form-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-[480px] overflow-hidden rounded-xl border border-app-sidebar-border bg-app-sidebar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <h2
            id="designer-form-modal-title"
            className="text-lg font-bold leading-6 text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-app-muted transition-colors hover:text-white"
            aria-label="Закрыть"
          >
            <IconX />
          </button>
        </div>
        <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-6 pb-6 pt-6">
          <DesignerForm
            key={designer?.id ?? "new"}
            theme="dark"
            variant="modal"
            designer={designer}
            onCancel={onClose}
            onSaved={onClose}
          />
        </div>
      </div>
    </div>
  );
}
