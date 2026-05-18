import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  filterCompetenciesForRole,
  ROLE_LABELS,
  type Competency,
} from "@/lib/competency-utils";
import type { Database } from "@/types/database";
import type { DesignerRole } from "@/types/database";

export type SelfReviewToken =
  Database["public"]["Tables"]["self_review_tokens"]["Row"];

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

export type PublicSelfReviewData = {
  designerName: string;
  designerRole: string;
  completed: boolean;
  expired: boolean;
  competencies: { id: string; title: string; description: string }[];
  initialScores: Record<string, number>;
};

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

  const { data: competencies, error: compError } = await admin
    .from("competencies")
    .select("id, block, title, description")
    .order("block")
    .order("title");

  if (compError) throw compError;

  const visible = filterCompetenciesForRole(
    (competencies ?? []) as Competency[],
    designer.role as DesignerRole
  );

  const { data: scores } = await admin
    .from("scores")
    .select("competency_id, self_score")
    .eq("designer_id", tokenRow.designer_id);

  const initialScores: Record<string, number> = {};
  for (const s of scores ?? []) {
    if (s.self_score !== null) {
      initialScores[s.competency_id] = Number(s.self_score);
    }
  }

  return {
    designerName: designer.name,
    designerRole: ROLE_LABELS[designer.role as DesignerRole],
    completed,
    expired,
    competencies: visible.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
    })),
    initialScores,
  };
}
