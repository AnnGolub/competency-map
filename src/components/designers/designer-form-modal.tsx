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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="designer-form-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-[500px] overflow-hidden rounded-[24px] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-7 pt-7">
          <h2
            id="designer-form-modal-title"
            className="font-sf pr-10 text-[22px] font-bold leading-[26px] tracking-[0.2px] text-[rgba(3,3,6,0.88)]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-7 top-7 inline-flex items-center justify-center text-[rgba(4,4,19,0.55)] transition-colors hover:text-[rgba(3,3,6,0.88)]"
            aria-label="Закрыть"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <DesignerForm
          key={designer?.id ?? "new"}
          variant="modal"
          designer={designer}
          onCancel={onClose}
          onSaved={onClose}
        />
      </div>
    </div>
  );
}
