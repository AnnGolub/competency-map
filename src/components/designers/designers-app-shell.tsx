import type { ReactNode } from "react";

export function DesignersAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="font-sf flex h-screen flex-col overflow-hidden bg-white text-[rgba(3,3,6,0.88)]">
      {children}
    </div>
  );
}
