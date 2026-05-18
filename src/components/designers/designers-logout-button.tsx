"use client";

import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { IconLogout } from "@/components/ui/tabler-icons";

export function DesignersLogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title="Выйти"
      aria-label="Выйти"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
      className="rounded-lg p-2 text-app-muted transition-colors hover:bg-app-surface hover:text-white disabled:opacity-50"
    >
      <IconLogout />
    </button>
  );
}
