import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

type PageShellProps = {
  title?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({
  title,
  backHref,
  backLabel = "Назад",
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b-[0.5px] border-neutral-200 px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          {backHref ? (
            <Link
              href={backHref}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              ← {backLabel}
            </Link>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {actions}
            <SignOutButton />
          </div>
        </div>
        {title ? (
          <h1 className="mx-auto mt-4 max-w-3xl text-2xl font-medium tracking-tight">
            {title}
          </h1>
        ) : null}
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
