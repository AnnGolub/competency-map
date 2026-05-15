"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ReviewEntry = {
  competencyId: string;
  score: number;
  comment: string;
};

export async function saveReview(
  designerId: string,
  entries: ReviewEntry[]
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Требуется авторизация" };
  }

  const rows = entries.map((entry) => ({
    designer_id: designerId,
    competency_id: entry.competencyId,
    score: entry.score,
    comment: entry.comment.trim(),
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("scores").upsert(rows, {
    onConflict: "designer_id,competency_id",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/designers/${designerId}`);
  revalidatePath(`/designers/${designerId}/review`);
  revalidatePath("/designers");
  redirect(`/designers/${designerId}`);
}
