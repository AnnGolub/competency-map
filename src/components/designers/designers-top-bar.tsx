import type { ReactNode } from "react";
import { APP_CONTENT_SHELL } from "@/lib/layout/content-shell";

export {
  APP_CONTENT_MAX,
  APP_CONTENT_SHELL,
  APP_PAGE_GUTTER,
  DESIGNERS_CONTENT_MAX,
  DESIGNERS_CONTENT_SHELL,
  DESIGNERS_PAGE_GUTTER,
} from "@/lib/layout/content-shell";

export const HEADER_GLASS_ICON_BUTTON =
  "inline-flex min-h-8 min-w-8 max-w-8 items-center justify-center gap-1 rounded-lg bg-[rgba(15,25,55,0.10)] p-1 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px]";

export function DesignersTopBar({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="shrink-0 border border-[#EDEEF0] bg-[#F2F3F5]">
      <div className={`flex items-center justify-between gap-6 py-4 ${APP_CONTENT_SHELL}`}>
        <h1
          className="font-sf text-[18px] font-bold leading-6"
          style={{
            color: "rgba(3, 3, 6, 0.88)",
            letterSpacing: "0.38px",
          }}
        >
          {title}
        </h1>
        {actions ? (
          <div className="flex items-center justify-center gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
