"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupItemsByCompetency } from "@/lib/competency-utils";
import { getSessionContext } from "@/lib/session";
import type { DesignerRole } from "@/types/database";

const TOKEN_TTL_DAYS = 14;

export type SelfReviewEntry = {
  competencyItemId: string;
  selfScore: number;
};

function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export async function generateSelfReviewLink(
  designerId: string
): Promise<{ url?: string; error?: string }> {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return { error: "Недостаточно прав" };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_TTL_DAYS);

  const admin = createAdminClient();
  const { error } = await admin.from("self_review_tokens").insert({
    designer_id: designerId,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/designers/${designerId}`);

  const url = `${getSiteOrigin()}/self-review?token=${token}`;
  return { url };
}

export async function submitSelfReviewByToken(
  token: string,
  entries: SelfReviewEntry[]
): Promise<{ error?: string }> {
  const admin = createAdminClient();

  const { data: tokenRow, error: tokenError } = await admin
    .from("self_review_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (tokenError) return { error: tokenError.message };
  if (!tokenRow) return { error: "Ссылка недействительна" };
  if (tokenRow.completed_at) {
    return { error: "Самооценка уже отправлена" };
  }
  if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return { error: "Срок действия ссылки истёк" };
  }

  const { data: designer, error: designerError } = await admin
    .from("designers")
    .select("*")
    .eq("id", tokenRow.designer_id)
    .maybeSingle();

  if (designerError) return { error: designerError.message };
  if (!designer) return { error: "Дизайнер не найден" };

  const { data: items, error: itemsError } = await admin
    .from("competency_items")
    .select("id, competency_id, only_lead");

  if (itemsError) return { error: itemsError.message };

  const itemsByCompetency = groupItemsByCompetency(
    items ?? [],
    designer.role as DesignerRole
  );
  const allowedItemIds = new Set<string>();
  for (const list of Array.from(itemsByCompetency.values())) {
    for (const item of list) {
      allowedItemIds.add(item.id);
    }
  }

  if (entries.length !== allowedItemIds.size) {
    return { error: "Заполните все подпункты" };
  }

  for (const entry of entries) {
    if (!allowedItemIds.has(entry.competencyItemId)) {
      return { error: "Недопустимый подпункт" };
    }

    const { data: existing } = await admin
      .from("item_scores")
      .select("id, score, reviewed_by, reviewed_at")
      .eq("designer_id", tokenRow.designer_id)
      .eq("competency_item_id", entry.competencyItemId)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from("item_scores")
        .update({ self_score: entry.selfScore })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await admin.from("item_scores").insert({
        designer_id: tokenRow.designer_id,
        competency_item_id: entry.competencyItemId,
        self_score: entry.selfScore,
        score: null,
        reviewed_by: null,
        reviewed_at: null,
      });
      if (error) return { error: error.message };
    }
  }

  const { error: completeError } = await admin
    .from("self_review_tokens")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  if (completeError) return { error: completeError.message };

  revalidatePath(`/designers/${tokenRow.designer_id}`);

  return {};
}
