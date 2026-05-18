import { IconUsers } from "@/components/ui/tabler-icons";

export function DesignersSidebar() {
  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center border-r border-app-border bg-app-sidebar py-6">
      <nav className="flex flex-col items-center gap-1">
        <a
          href="/designers"
          className="flex w-full flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-app-accent"
          aria-current="page"
        >
          <IconUsers className="text-app-accent" />
          <span className="text-center text-[10px] font-medium leading-tight">
            Дизайнеры
          </span>
        </a>
      </nav>
    </aside>
  );
}
