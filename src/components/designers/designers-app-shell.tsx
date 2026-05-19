import type { ReactNode } from "react";
import { DesignersSidebar } from "@/components/designers/designers-sidebar";

export function DesignersAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="font-avenir flex min-h-screen bg-app-canvas text-white">
      <DesignersSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
