import Link from "next/link";
import { IconDesignersNav } from "@/components/ui/tabler-icons";

export function DesignersSidebar() {
  return (
    <aside className="flex w-[224px] shrink-0 flex-col border-r border-app-sidebar-border bg-app-sidebar">
      <nav className="pt-28">
        <Link
          href="/designers"
          className="mr-[70px] flex items-center gap-2.5 rounded-xl bg-app-nav-tab py-3 pl-12 text-sm font-medium text-white transition-colors hover:bg-app-nav-tab/90"
          aria-current="page"
        >
          <IconDesignersNav className="shrink-0" />
          <span>Дизайнеры</span>
        </Link>
      </nav>
    </aside>
  );
}
