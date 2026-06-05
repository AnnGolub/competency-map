import type { ReactNode } from "react";
import { DesignersSidebar } from "@/components/designers/designers-sidebar";

export function DesignersAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="font-sf flex min-h-screen bg-white text-[rgba(3,3,6,0.88)]">
      <DesignersSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
