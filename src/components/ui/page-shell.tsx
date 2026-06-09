import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { APP_CONTENT_SHELL } from "@/lib/layout/content-shell";

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
      <header className="border-b-[0.5px] border-neutral-200 py-5">
        <div className={`flex items-center justify-between gap-4 ${APP_CONTENT_SHELL}`}>
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
          <h1 className={`mt-4 text-2xl font-medium tracking-tight ${APP_CONTENT_SHELL}`}>
            {title}
          </h1>
        ) : null}
      </header>
      <main className={`py-8 ${APP_CONTENT_SHELL}`}>{children}</main>
    </div>
  );
}
