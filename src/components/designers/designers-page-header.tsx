import Link from "next/link";
import type { ReactNode } from "react";
import { DesignersLogoutButton } from "@/components/designers/designers-logout-button";

export function DesignersPageHeader({
  title,
  backHref,
  backLabel = "Назад",
  subtitle,
  actions,
  showLogout = true,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  showLogout?: boolean;
}) {
  return (
    <header className="px-10 pt-10">
      {backHref ? (
        <Link
          href={backHref}
          className="text-sm text-app-muted transition-colors hover:text-white"
        >
          ← {backLabel}
        </Link>
      ) : null}
      <div
        className={`flex items-start justify-between gap-6 ${backHref ? "mt-4" : ""}`}
      >
        <div>
          <h1 className="text-page-title font-semibold tracking-tight text-white">
            {title}
          </h1>
          {subtitle ? (
            <div className="mt-2 text-sm text-app-muted">{subtitle}</div>
          ) : null}
        </div>
        {(actions || showLogout) && (
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            {showLogout ? <DesignersLogoutButton /> : null}
          </div>
        )}
      </div>
    </header>
  );
}
