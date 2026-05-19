import type { ReactNode } from "react";

/** Top Bar из Figma (node 8:714): заголовок раздела, экспорт, выход. */
export function DesignersTopBar({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="shrink-0 border border-app-sidebar-border bg-app-sidebar">
      <div className="flex h-16 items-center justify-between gap-6 px-8">
        <h1 className="text-[18px] font-bold leading-6 text-white">{title}</h1>
        {actions ? (
          <div className="flex items-center gap-6">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
