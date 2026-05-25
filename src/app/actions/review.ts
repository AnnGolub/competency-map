"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchReviewPageData } from "@/lib/data/queries";
import { getSessionContext } from "@/lib/session";

export type ReviewEntry = {
  competencyItemId: string;
  score: number;
};

export type FinalReviewEntry = {
  competencyItemId: string;
  finalScore: number;
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
  const reviewedAt = new Date().toISOString();

  for (const entry of entries) {
    const { data: existing } = await supabase
      .from("item_scores")
      .select("id, self_score")
      .eq("designer_id", designerId)
      .eq("competency_item_id", entry.competencyItemId)
      .maybeSingle();

    const payload = {
      designer_id: designerId,
      competency_item_id: entry.competencyItemId,
      score: entry.score,
      reviewed_by: session.userId,
      reviewed_at: reviewedAt,
      self_score: existing?.self_score ?? null,
    };

    if (existing) {
      const { error } = await supabase
        .from("item_scores")
        .update(payload)
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("item_scores").insert(payload);
      if (error) return { error: error.message };
    }
  }

  revalidatePath(`/designers/${designerId}`);
  revalidatePath(`/designers/${designerId}/review`);
  revalidatePath("/designers");
  redirect(`/designers/${designerId}`);
}

export async function saveFinalReview(
  designerId: string,
  entries: FinalReviewEntry[]
): Promise<{ error?: string }> {
  const session = await getSessionContext();
  if (!session) {
    return { error: "Требуется авторизация" };
  }
  if (!session.isAdmin) {
    return { error: "Финальное ревью доступно только лиду (admin)" };
  }

  const data = await fetchReviewPageData(designerId);
  if (!data) {
    return { error: "Дизайнер не найден" };
  }

  const allowedItems = Object.values(data.itemsByCompetency).flat();
  const allowedItemIds = new Set(allowedItems.map((item) => item.id));
  const selfReviewItemIds = new Set(
    allowedItems
      .filter((item) => data.designer.role === "lead" || !item.only_lead)
      .map((item) => item.id)
  );

  if (entries.length !== allowedItemIds.size) {
    return { error: "Заполните все финальные значения" };
  }

  for (const entry of entries) {
    if (!allowedItemIds.has(entry.competencyItemId)) {
      return { error: "Недопустимый подпункт" };
    }
    if (
      !Number.isFinite(entry.finalScore) ||
      entry.finalScore < 1 ||
      entry.finalScore > 4 ||
      Math.round(entry.finalScore * 10) % 5 !== 0
    ) {
      return { error: "Финальная оценка должна быть от 1 до 4 с шагом 0.5" };
    }
  }

  const supabase = createClient();
  const { data: existingRows, error: existingError } = await supabase
    .from("item_scores")
    .select("id, competency_item_id, score, self_score")
    .eq("designer_id", designerId)
    .in("competency_item_id", Array.from(allowedItemIds));

  if (existingError) {
    return { error: existingError.message };
  }

  const existingByItemId = new Map(
    (existingRows ?? []).map((row) => [row.competency_item_id, row])
  );

  for (const itemId of Array.from(allowedItemIds)) {
    const row = existingByItemId.get(itemId);
    if (!row || row.score === null) {
      return {
        error:
          "Сначала завершите оценку лида и самооценку по всем подпунктам перед финальным ревью.",
      };
    }
    if (selfReviewItemIds.has(itemId) && row.self_score === null) {
      return {
        error:
          "Сначала завершите оценку лида и самооценку по всем подпунктам перед финальным ревью.",
      };
    }
  }

  for (const entry of entries) {
    const existing = existingByItemId.get(entry.competencyItemId);
    if (!existing) {
      return { error: "Не найдены данные по одному из подпунктов" };
    }

    const { error } = await supabase
      .from("item_scores")
      .update({ final_score: entry.finalScore })
      .eq("id", existing.id);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath(`/designers/${designerId}`);
  revalidatePath(`/designers/${designerId}/final-review`);
  revalidatePath("/designers");
  redirect(`/designers/${designerId}`);
}
