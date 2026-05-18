import Link from "next/link";
import { IconUsersFilled } from "@/components/ui/tabler-icons";

export function DesignersSidebar() {
  return (
    <aside className="flex w-[224px] shrink-0 flex-col border-r border-app-sidebar-border bg-app-sidebar">
      <nav className="px-8 pt-28">
        <Link
          href="/designers"
          className="flex h-11 w-40 items-center gap-2.5 rounded-xl bg-app-nav-tab px-3 text-sm font-medium text-white transition-colors hover:bg-app-nav-tab/90"
          aria-current="page"
        >
          <IconUsersFilled className="shrink-0" />
          <span>Дизайнеры</span>
        </Link>
      </nav>
    </aside>
  );
}
