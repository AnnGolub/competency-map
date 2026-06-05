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

export function DesignersSidebar() {
  const pathname = usePathname();
  const designersActive = isDesignersRoute(pathname);
  const questionnaireActive = pathname === "/questionnaire";

  return (
    <aside
      className="flex h-full min-h-[900px] w-[224px] shrink-0 flex-col gap-2.5 border border-[#EDEEF0] bg-[#F2F3F5] px-8 pt-24"
      style={{ paddingBottom: 0 }}
    >
      <nav className="flex flex-col gap-2.5">
        <Link
          href="/designers"
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
            designersActive
              ? "bg-[#0F0F0F] text-white"
              : "text-[rgba(60,60,67,0.66)] hover:bg-[#EDEEF0] hover:text-[rgba(3,3,6,0.88)]"
          }`}
          aria-current={designersActive ? "page" : undefined}
        >
          <IconDesignersNav
            className={`shrink-0 ${designersActive ? "text-white" : "text-[rgba(60,60,67,0.66)]"}`}
          />
          <span>Дизайнеры</span>
        </Link>
        <Link
          href="/questionnaire"
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
            questionnaireActive
              ? "bg-[#0F0F0F] text-white"
              : "text-[rgba(60,60,67,0.66)] hover:bg-[#EDEEF0] hover:text-[rgba(3,3,6,0.88)]"
          }`}
          aria-current={questionnaireActive ? "page" : undefined}
        >
          <IconQuestionnaireNav className="shrink-0" />
          <span>Опросник</span>
        </Link>
      </nav>
    </aside>
  );
}
