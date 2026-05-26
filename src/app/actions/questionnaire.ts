"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALL_SCORE_QUESTIONS,
  QUESTIONNAIRE_SCORE_KEYS,
  type QuestionnaireScoreKey,
} from "@/lib/questionnaire";

export type SubmitQuestionnairePayload = {
  respondentName: string;
  context: string;
  mentorshipFollowup: string;
  processesFollowup: string;
  communicationFollowup: string;
  startDoing: string;
  stopDoing: string;
  continueDoing: string;
  scores: Record<QuestionnaireScoreKey, number>;
};

function isValidScore(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 10;
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
  if (!payload.startDoing.trim() || !payload.stopDoing.trim() || !payload.continueDoing.trim()) {
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
      mentorship_followup: payload.mentorshipFollowup.trim() || null,
      processes_followup: payload.processesFollowup.trim() || null,
      communication_followup: payload.communicationFollowup.trim() || null,
      start_doing: payload.startDoing.trim(),
      stop_doing: payload.stopDoing.trim(),
      continue_doing: payload.continueDoing.trim(),
    })
    .select("id")
    .single();

  if (responseError) return { error: responseError.message };

  const answers = ALL_SCORE_QUESTIONS.map((question) => ({
    response_id: responseRow.id,
    question_key: question.key,
    score: payload.scores[question.key as QuestionnaireScoreKey],
  }));

  const { error: answersError } = await admin
    .from("questionnaire_answers")
    .insert(answers);

  if (answersError) return { error: answersError.message };

  return {};
}
