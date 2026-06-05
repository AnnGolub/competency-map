"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconQuestionnaireNav } from "@/components/designers/designers-icons";
import { IconDesignersNav } from "@/components/ui/tabler-icons";

function isDesignersRoute(pathname: string) {
  return (
    pathname === "/designers" ||
    (pathname.startsWith("/designers/") &&
      !pathname.startsWith("/designers/questionnaire"))
  );
}

const NAV_ITEM_BASE =
  "font-sf flex h-11 w-40 items-center gap-2 px-4 py-2 text-base font-normal leading-6 tracking-[-0.24px] transition-colors";

const NAV_ITEM_ACTIVE =
  `${NAV_ITEM_BASE} rounded-xl bg-[#212124] text-[rgba(255,255,255,0.94)]`;

const NAV_ITEM_INACTIVE =
  `${NAV_ITEM_BASE} rounded-lg bg-transparent text-[rgba(4,4,19,0.55)]`;

export function DesignersSidebar() {
  const pathname = usePathname();
  const designersActive = isDesignersRoute(pathname);
  const questionnaireActive = pathname === "/questionnaire";

  return (
    <aside
      className="flex h-full min-h-[900px] w-[224px] shrink-0 flex-col gap-2.5 border border-[#EDEEF0] bg-[#F2F3F5] px-8 pt-[96px]"
      style={{ paddingBottom: 0 }}
    >
      <nav className="flex flex-col gap-2.5">
        <Link
          href="/designers"
          className={designersActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}
          aria-current={designersActive ? "page" : undefined}
        >
          <IconDesignersNav
            className={`shrink-0 ${
              designersActive
                ? "text-[rgba(255,255,255,0.94)]"
                : "text-[rgba(4,4,19,0.55)]"
            }`}
          />
          <span>Дизайнеры</span>
        </Link>
        <Link
          href="/questionnaire"
          className={questionnaireActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}
          aria-current={questionnaireActive ? "page" : undefined}
        >
          <IconQuestionnaireNav
            className={`shrink-0 ${
              questionnaireActive
                ? "text-[rgba(255,255,255,0.94)]"
                : "text-[rgba(4,4,19,0.55)]"
            }`}
          />
          <span>Опросник</span>
        </Link>
      </nav>
    </aside>
  );
}
