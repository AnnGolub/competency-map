"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDesignersNav } from "@/components/ui/tabler-icons";

const NAV_LINK =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors";

function isDesignersRoute(pathname: string) {
  return (
    pathname === "/designers" ||
    (pathname.startsWith("/designers/") &&
      !pathname.startsWith("/designers/questionnaire"))
  );
}

export function DesignersSidebar() {
  const pathname = usePathname();
  const designersActive = isDesignersRoute(pathname);
  const questionnaireActive = pathname.startsWith("/designers/questionnaire");

  return (
    <aside className="flex w-[224px] shrink-0 flex-col border-r border-app-sidebar-border bg-app-sidebar">
      <nav className="flex flex-col gap-4 px-3 pt-[82px]">
        <Link
          href="/designers"
          className={`${NAV_LINK} ${
            designersActive
              ? "bg-app-nav-tab text-white"
              : "text-app-muted hover:bg-app-nav-tab/50 hover:text-white"
          }`}
          aria-current={designersActive ? "page" : undefined}
        >
          <IconDesignersNav className="shrink-0" />
          <span>Дизайнеры</span>
        </Link>
        <Link
          href="/designers/questionnaire"
          className={`${NAV_LINK} ${
            questionnaireActive
              ? "bg-app-nav-tab text-white"
              : "text-app-muted hover:bg-app-nav-tab/50 hover:text-white"
          }`}
          aria-current={questionnaireActive ? "page" : undefined}
        >
          <span className="pl-6">Опросник</span>
        </Link>
      </nav>
    </aside>
  );
}
