"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/session";

export type ReviewEntry = {
  competencyId: string;
  score: number;
  comment: string;
};

export async function saveReview(
  designerId: string,
  entries: ReviewEntry[]
): Promise<{ error?: string }> {
  const session = await getSessionContext();
  if (!session) {
    return { error: "Требуется авторизация" };
  }
  if (!session.isAdmin) {
    return { error: "Ревью доступно только лиду (admin)" };
  }

  const supabase = createClient();

  for (const entry of entries) {
    const { data: existing } = await supabase
      .from("scores")
      .select("id, self_score")
      .eq("designer_id", designerId)
      .eq("competency_id", entry.competencyId)
      .maybeSingle();

    const payload = {
      designer_id: designerId,
      competency_id: entry.competencyId,
      score: entry.score,
      comment: entry.comment.trim(),
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
      self_score: existing?.self_score ?? null,
    };

    if (existing) {
      const { error } = await supabase
        .from("scores")
        .update(payload)
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("scores").insert(payload);
      if (error) return { error: error.message };
    }
  }

  revalidatePath(`/designers/${designerId}`);
  revalidatePath(`/designers/${designerId}/review`);
  revalidatePath("/designers");
  redirect(`/designers/${designerId}`);
}
