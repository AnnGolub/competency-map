"use client";

import { useState } from "react";
import { DesignerFormModal } from "@/components/designers/designer-form-modal";
import type { Designer } from "@/lib/competency-utils";

export function EditDesignerPanel({
  designer,
  open: controlledOpen,
  onClose,
  hideTrigger,
}: {
  designer: Designer;
  open?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  function handleClose() {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  }

  return (
    <>
      {!hideTrigger && !isControlled ? (
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
          className="rounded-lg border border-app-border bg-app-surface px-4 py-2 text-sm text-app-muted transition-colors hover:border-app-muted hover:text-white"
        >
          Изменить
        </button>
      ) : null}

      <DesignerFormModal
        open={isOpen}
        title="Редактировать дизайнера"
        designer={designer}
        onClose={handleClose}
      />
    </>
  );
}
