import Link from "next/link";
import type { ReactNode } from "react";
import { IconSelectArrow } from "@/components/designers/designers-icons";

export function DesignerBackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-5 w-fit items-center gap-1 text-sm font-semibold leading-5 text-[#C7C9D9] transition-colors hover:text-white"
    >
      <IconSelectArrow className="rotate-90 text-current" />
      {children}
    </Link>
  );
}
