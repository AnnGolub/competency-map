import Link from "next/link";
import { IconDesignersNav } from "@/components/ui/tabler-icons";

export function DesignersSidebar() {
  return (
    <aside className="flex w-[224px] shrink-0 flex-col border-r border-app-sidebar-border bg-app-sidebar">
      <nav className="px-3 pt-28">
        <Link
          href="/designers"
          className="flex w-full items-center gap-2.5 rounded-xl bg-app-nav-tab px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-app-nav-tab/90"
          aria-current="page"
        >
          <IconDesignersNav className="shrink-0" />
          <span>Дизайнеры</span>
        </Link>
      </nav>
    </aside>
  );
}
