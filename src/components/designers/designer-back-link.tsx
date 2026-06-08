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
      className="font-sf inline-flex w-fit items-center gap-1.5 border-0 bg-transparent text-sm font-medium leading-5 text-[rgba(3,3,6,0.88)] transition-opacity hover:opacity-80"
    >
      <IconSelectArrow className="rotate-90 text-[rgba(3,3,6,0.88)]" />
      {children}
    </Link>
  );
}
