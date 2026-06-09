import type { ReactNode } from "react";

export const APP_CONTENT_MAX = "mx-auto w-full max-w-[1440px]";
export const APP_PAGE_GUTTER = "px-16";
export const APP_CONTENT_SHELL = `${APP_CONTENT_MAX} ${APP_PAGE_GUTTER}`;

/** @deprecated Use APP_CONTENT_MAX */
export const DESIGNERS_CONTENT_MAX = APP_CONTENT_MAX;
/** @deprecated Use APP_PAGE_GUTTER */
export const DESIGNERS_PAGE_GUTTER = APP_PAGE_GUTTER;
/** @deprecated Use APP_CONTENT_SHELL */
export const DESIGNERS_CONTENT_SHELL = APP_CONTENT_SHELL;

export function AppPageContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${APP_CONTENT_SHELL}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

export function AppContentMain({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="min-h-screen bg-white py-8">
      <AppPageContent className={className}>{children}</AppPageContent>
    </main>
  );
}
