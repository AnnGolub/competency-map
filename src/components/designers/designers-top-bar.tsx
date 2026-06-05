import type { ReactNode } from "react";

export function DesignersTopBar({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="shrink-0 border border-[#EDEEF0] bg-[#F2F3F5]">
      <div className="mx-auto flex w-full max-w-[1216px] items-center justify-between gap-6 px-8 py-4">
        <h1
          className="text-[18px] font-bold leading-6"
          style={{
            color: "rgba(3, 3, 6, 0.88)",
            letterSpacing: "0.38px",
          }}
        >
          {title}
        </h1>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
