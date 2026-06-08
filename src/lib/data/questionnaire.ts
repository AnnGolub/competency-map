import { averageScore, type Designer } from "@/lib/competency-utils";
import {
  COMMUNICATION_QUESTIONS,
  MENTORSHIP_QUESTIONS,
  PROCESSES_QUESTIONS,
} from "@/lib/questionnaire";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PublicQuestionnaireData = {
  linkId: string;
  token: string;
  designerId: string;
  designerName: string;
};

type QuestionnaireAnswerSummary =
  Database["public"]["Tables"]["questionnaire_answers"]["Row"];

type QuestionnaireResponseSummary = Pick<
  Database["public"]["Tables"]["questionnaire_responses"]["Row"],
  "id" | "designer_id"
> & {
  questionnaire_answers: QuestionnaireAnswerSummary[] | QuestionnaireAnswerSummary | null;
};

export type QuestionnaireOverviewDesigner = Designer & {
  responseCount: number;
  mentorshipAverage: number | null;
  processesAverage: number | null;
  communicationAverage: number | null;
};

const MENTORSHIP_KEYS = MENTORSHIP_QUESTIONS.map((question) => question.key);
const PROCESSES_KEYS = PROCESSES_QUESTIONS.map((question) => question.key);
const COMMUNICATION_KEYS = COMMUNICATION_QUESTIONS.map((question) => question.key);

function asAnswerArray(
  answers: QuestionnaireResponseSummary["questionnaire_answers"]
): QuestionnaireAnswerSummary[] {
  if (!answers) return [];
  return Array.isArray(answers) ? answers : [answers];
}

function averageByKeys(
  answers: QuestionnaireAnswerSummary[],
  keys: readonly string[]
): number | null {
  const values = answers
    .filter(
      (answer): answer is QuestionnaireAnswerSummary & { score: number } =>
        keys.includes(answer.question_key) && answer.score !== null
    )
    .map((answer) => Number(answer.score));

  return averageScore(values);
}

export async function fetchQuestionnaireOverview(): Promise<
  QuestionnaireOverviewDesigner[]
> {
  const admin = createAdminClient();

  const [{ data: designers, error: designersError }, { data: responses, error: responsesError }] =
    await Promise.all([
      admin.from("designers").select("*").order("name"),
      admin
        .from("questionnaire_responses")
        .select("id, designer_id, questionnaire_answers(question_key, score)"),
    ]);

  if (designersError) throw designersError;
  if (responsesError) throw responsesError;

  const answersByDesigner = new Map<string, QuestionnaireAnswerSummary[]>();
  const responseCountByDesigner = new Map<string, number>();

  for (const response of (responses ?? []) as QuestionnaireResponseSummary[]) {
    responseCountByDesigner.set(
      response.designer_id,
      (responseCountByDesigner.get(response.designer_id) ?? 0) + 1
    );

    const answers = answersByDesigner.get(response.designer_id) ?? [];
    answers.push(...asAnswerArray(response.questionnaire_answers));
    answersByDesigner.set(response.designer_id, answers);
  }

  return (designers ?? []).map((designer) => {
    const answers = answersByDesigner.get(designer.id) ?? [];

    return {
      ...designer,
      responseCount: responseCountByDesigner.get(designer.id) ?? 0,
      mentorshipAverage: averageByKeys(answers, MENTORSHIP_KEYS),
      processesAverage: averageByKeys(answers, PROCESSES_KEYS),
      communicationAverage: averageByKeys(answers, COMMUNICATION_KEYS),
    };
  });
}

export async function fetchQuestionnaireFeedbackStats(
  designerId: string
): Promise<{ responseCount: number; averageScore: number | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("questionnaire_responses")
    .select("id, questionnaire_answers(question_key, score)")
    .eq("designer_id", designerId);

  if (error) throw error;

  const responses = (data ?? []) as QuestionnaireResponseSummary[];
  const answers = responses.flatMap((response) =>
    asAnswerArray(response.questionnaire_answers)
  );
  const allScoreKeys = [
    ...MENTORSHIP_KEYS,
    ...PROCESSES_KEYS,
    ...COMMUNICATION_KEYS,
  ];

  return {
    responseCount: responses.length,
    averageScore: averageByKeys(answers, allScoreKeys),
  };
}

export async function fetchPublicQuestionnaireByToken(
  token: string
): Promise<PublicQuestionnaireData | null> {
  const admin = createAdminClient();

  const { data: linkRow, error: linkError } = await admin
    .from("questionnaire_links")
    .select("id, designer_id, token")
    .eq("token", token)
    .maybeSingle();

  if (linkError) throw linkError;
  if (!linkRow) return null;

  const { data: designer, error: designerError } = await admin
    .from("designers")
    .select("id, name")
    .eq("id", linkRow.designer_id)
    .maybeSingle();

  if (designerError) throw designerError;
  if (!designer) return null;

  return {
    linkId: linkRow.id,
    token: linkRow.token,
    designerId: designer.id,
    designerName: designer.name,
  };
}
