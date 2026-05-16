"use client";

import { signOut } from "@/app/actions/auth";
import { useTransition } from "react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-50"
    >
      {isPending ? "Выход…" : "Выйти"}
    </button>
  );
}
