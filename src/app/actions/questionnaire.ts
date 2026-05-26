"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALL_SCORE_QUESTIONS,
  QUESTIONNAIRE_SCORE_KEYS,
  type QuestionnaireScoreKey,
} from "@/lib/questionnaire";

export type SubmitQuestionnairePayload = {
  respondentName: string;
  context: string;
  scores: Record<QuestionnaireScoreKey, number>;
  textAnswers: {
    mentorship_followup: string;
    processes_followup: string;
    communication_followup: string;
    start_doing: string;
    stop_doing: string;
    continue_doing: string;
  };
};

function isValidScore(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 10;
}

function getSiteOrigin(): string {
  const fromAppEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromAppEnv) return fromAppEnv;
  const fromSiteEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromSiteEnv) return fromSiteEnv;
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export async function generateQuestionnaireLink(
  designerId: string
): Promise<string> {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    throw new Error("Недостаточно прав");
  }

  const supabase = createClient();

  const { data: existing, error: existingError } = await supabase
    .from("questionnaire_links")
    .select("token")
    .eq("designer_id", designerId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const origin = getSiteOrigin();
  if (existing?.token) {
    return `${origin}/questionnaire/${existing.token}`;
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const { error: insertError } = await supabase
    .from("questionnaire_links")
    .insert({ designer_id: designerId, token });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath(`/designers/${designerId}`);
  return `${origin}/questionnaire/${token}`;
}

export async function submitQuestionnaireByToken(
  token: string,
  payload: SubmitQuestionnairePayload
): Promise<{ error?: string }> {
  const admin = createAdminClient();

  const { data: linkRow, error: linkError } = await admin
    .from("questionnaire_links")
    .select("id, designer_id")
    .eq("token", token)
    .maybeSingle();

  if (linkError) return { error: linkError.message };
  if (!linkRow) return { error: "Ссылка недействительна" };

  if (!payload.context.trim()) {
    return { error: "Опишите, где вы работали или взаимодействовали вместе." };
  }
  if (
    !payload.textAnswers.start_doing.trim() ||
    !payload.textAnswers.stop_doing.trim() ||
    !payload.textAnswers.continue_doing.trim()
  ) {
    return { error: "Заполните все обязательные поля на последнем шаге." };
  }

  for (const questionKey of QUESTIONNAIRE_SCORE_KEYS) {
    const value = payload.scores[questionKey as QuestionnaireScoreKey];
    if (!isValidScore(value)) {
      return { error: "Заполните все оценки от 1 до 10." };
    }
  }

  const { data: responseRow, error: responseError } = await admin
    .from("questionnaire_responses")
    .insert({
      questionnaire_link_id: linkRow.id,
      designer_id: linkRow.designer_id,
      respondent_name: payload.respondentName.trim() || null,
      context: payload.context.trim(),
    })
    .select("id")
    .single();

  if (responseError) return { error: responseError.message };

  const answers = [
    ...ALL_SCORE_QUESTIONS.map((question) => ({
      response_id: responseRow.id,
      question_key: question.key,
      score: payload.scores[question.key as QuestionnaireScoreKey],
      text_answer: null,
    })),
    ...Object.entries(payload.textAnswers)
      .map(([key, text]) => ({
        response_id: responseRow.id,
        question_key: key,
        score: null,
        text_answer: text.trim() || null,
      }))
      .filter((answer) => answer.text_answer !== null),
  ];

  const { error: answersError } = await admin
    .from("questionnaire_answers")
    .insert(answers);

  if (answersError) return { error: answersError.message };

  return {};
}
