export const dynamic = "force-dynamic";

import { DesignersList } from "@/components/designers/designers-list";
import { PageShell } from "@/components/ui/page-shell";
import { fetchDesignersWithAverages } from "@/lib/data/queries";

export default async function DesignersPage() {
  const designers = await fetchDesignersWithAverages();

  return (
    <PageShell title="Дизайнеры">
      <DesignersList designers={designers} />
    </PageShell>
  );
}
