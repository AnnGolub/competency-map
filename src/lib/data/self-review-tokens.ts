import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  filterCompetenciesForRole,
  groupItemsByCompetency,
  ROLE_LABELS,
  type Competency,
  type CompetencyItem,
} from "@/lib/competency-utils";
import type { Database } from "@/types/database";
import type { CompetencyBlock, DesignerRole } from "@/types/database";

export type SelfReviewToken =
  Database["public"]["Tables"]["self_review_tokens"]["Row"];

export type PublicSelfReviewItem = {
  id: string;
  text: string;
  expected_junior: number | null;
  expected_middle: number | null;
  expected_senior: number | null;
  expected_lead: number | null;
};

export type PublicSelfReviewCompetency = Competency & {
  items: PublicSelfReviewItem[];
};

export type PublicSelfReviewData = {
  designerName: string;
  designerRole: string;
  role: DesignerRole;
  completed: boolean;
  expired: boolean;
  competencies: PublicSelfReviewCompetency[];
  initialScores: Record<string, number>;
};

export async function hasCompletedSelfReview(
  designerId: string
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("self_review_tokens")
    .select("id")
    .eq("designer_id", designerId)
    .not("completed_at", "is", null)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function fetchPublicSelfReviewByToken(
  token: string
): Promise<PublicSelfReviewData | null> {
  const admin = createAdminClient();

  const { data: tokenRow, error: tokenError } = await admin
    .from("self_review_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (tokenError) throw tokenError;
  if (!tokenRow) return null;

  const expired = new Date(tokenRow.expires_at).getTime() < Date.now();
  const completed = tokenRow.completed_at !== null;

  const { data: designer, error: designerError } = await admin
    .from("designers")
    .select("name, role")
    .eq("id", tokenRow.designer_id)
    .maybeSingle();

  if (designerError) throw designerError;
  if (!designer) return null;

  const role = designer.role as DesignerRole;

  const [{ data: competencies, error: compError }, { data: items, error: itemsError }] =
    await Promise.all([
      admin
        .from("competencies")
        .select(
          "id, block, title, description, expected_junior, expected_middle, expected_senior, expected_lead, indicators_1, indicators_2, indicators_3, indicators_4"
        )
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("title"),
      admin
        .from("competency_items")
        .select(
          "id, competency_id, text, only_lead, expected_junior, expected_middle, expected_senior, expected_lead"
        )
        .order("text"),
    ]);

  if (compError) throw compError;
  if (itemsError) throw itemsError;

  const visible = filterCompetenciesForRole(
    (competencies ?? []) as Competency[],
    role
  );
  const itemsByCompetency = groupItemsByCompetency(
    (items ?? []) as CompetencyItem[],
    role
  );

  const { data: itemScores } = await admin
    .from("item_scores")
    .select("competency_item_id, self_score")
    .eq("designer_id", tokenRow.designer_id);

  const initialScores: Record<string, number> = {};
  for (const s of itemScores ?? []) {
    if (s.self_score !== null) {
      initialScores[s.competency_item_id] = Number(s.self_score);
    }
  }

  const publicCompetencies: PublicSelfReviewCompetency[] = visible.map((c) => {
    const competencyItems = itemsByCompetency.get(c.id) ?? [];
    return {
      ...c,
      items: competencyItems.map((item) => ({
        id: item.id,
        text: item.text,
        expected_junior: item.expected_junior,
        expected_middle: item.expected_middle,
        expected_senior: item.expected_senior,
        expected_lead: item.expected_lead,
      })),
    };
  }).filter((c) => c.items.length > 0);

  return {
    designerName: designer.name,
    designerRole: ROLE_LABELS[role],
    role,
    completed,
    expired,
    competencies: publicCompetencies,
    initialScores,
  };
}
