import type { ReactNode } from "react";

const TOOLTIP_PANEL_CLASS =
  "inline-flex w-[312px] min-w-[312px] max-w-[312px] flex-col items-start gap-4 rounded-xl bg-white p-4 font-sf text-sm font-normal leading-5 text-[#0E0E0E] shadow-[0_20px_24px_0_rgba(0,0,0,0.08),0_12px_16px_0_rgba(0,0,0,0.04),0_4px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.04)]";

export function TooltipArrow({ side }: { side: "bottom" | "left" }) {
  if (side === "left") {
    return (
      <svg
        width={8}
        height={16}
        viewBox="0 0 8 16"
        className="shrink-0"
        aria-hidden
      >
        <path d="M8 0V16L0 8Z" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg
      width={16}
      height={8}
      viewBox="0 0 16 8"
      className="shrink-0"
      aria-hidden
    >
      <path d="M0 0H16L8 8Z" fill="#FFFFFF" />
    </svg>
  );
}

export function TooltipPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="tooltip" className={`${TOOLTIP_PANEL_CLASS} ${className}`}>
      {children}
    </div>
  );
}

export function TooltipAbove({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
      <TooltipPanel>{children}</TooltipPanel>
      <TooltipArrow side="bottom" />
    </div>
  );
}

export function TooltipRightOf({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 flex -translate-y-1/2 items-center">
      <TooltipArrow side="left" />
      <TooltipPanel>{children}</TooltipPanel>
    </div>
  );
}
