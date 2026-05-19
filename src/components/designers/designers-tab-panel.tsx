import type { ReactNode } from "react";

export function DesignersTabPanel({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-app-sidebar-border bg-app-sidebar">
      <div className="flex items-center justify-between gap-6 pb-5 pl-8 pr-8 pt-5">
        <h1 className="text-[18px] font-bold leading-6 text-white">{title}</h1>
        {actions ? <div className="flex items-center gap-6">{actions}</div> : null}
      </div>
    </header>
  );
}
