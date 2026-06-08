"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  COMMUNICATION_QUESTIONS,
  MENTORSHIP_QUESTIONS,
  PROCESSES_QUESTIONS,
} from "@/lib/questionnaire";
import { averageScore } from "@/lib/competency-utils";
import { IconChevronDown } from "@/components/ui/tabler-icons";
import type { Database } from "@/types/database";

type QuestionnaireAnswerRow = Database["public"]["Tables"]["questionnaire_answers"]["Row"];
type QuestionnaireResponseRow = Database["public"]["Tables"]["questionnaire_responses"]["Row"];
type QuestionnaireResponseWithAnswers = QuestionnaireResponseRow & {
  questionnaire_answers: QuestionnaireAnswerRow[] | null;
};

type ScoreQuestion = {
  key: string;
  text: string;
  left: string;
  right: string;
};

type FeedbackGroup = {
  key: "mentorship" | "processes" | "communication";
  title: string;
  questions: readonly ScoreQuestion[];
};

const FEEDBACK_GROUPS: readonly FeedbackGroup[] = [
  {
    key: "mentorship",
    title: "Менторство",
    questions: MENTORSHIP_QUESTIONS,
  },
  {
    key: "processes",
    title: "Процессы",
    questions: PROCESSES_QUESTIONS,
  },
  {
    key: "communication",
    title: "Коммуникация",
    questions: COMMUNICATION_QUESTIONS,
  },
] as const;

const BLOCK_CARD_CLASS =
  "flex flex-col gap-6 rounded-[24px] bg-[#F2F3F5] p-6";

function buildAnswerMap(answers: QuestionnaireAnswerRow[] | null) {
  return new Map(
    (answers ?? []).flatMap((answer) =>
      answer.score !== null ? [[answer.question_key, Number(answer.score)] as const] : []
    )
  );
}

function buildTextAnswerMap(answers: QuestionnaireAnswerRow[] | null) {
  return new Map(
    (answers ?? []).flatMap((answer) => {
      const text = answer.text_answer?.trim();
      return text ? [[answer.question_key, text] as const] : [];
    })
  );
}

function averageForQuestion(
  responses: QuestionnaireResponseWithAnswers[],
  questionKey: string
) {
  const values = responses.flatMap((response) => {
    const answerMap = buildAnswerMap(response.questionnaire_answers);
    const score = answerMap.get(questionKey);
    return typeof score === "number" ? [score] : [];
  });

  return averageScore(values);
}

function QuestionScoreRow({
  question,
  average,
}: {
  question: ScoreQuestion;
  average: number | null;
}) {
  const width = average === null ? 0 : `${(average / 10) * 100}%`;

  return (
    <div className="rounded-xl bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="font-sf text-sm leading-5 text-[rgba(3,3,6,0.88)]">
          {question.text}
        </p>
        <span className="font-sf shrink-0 text-sm font-bold tabular-nums text-[rgba(3,3,6,0.88)]">
          {average === null ? "—" : average.toFixed(1)}
        </span>
      </div>
      <div
        className="mt-3 overflow-hidden rounded-[2px]"
        style={{ height: 4, background: "#E0E0E0" }}
      >
        <div
          style={{
            width,
            height: "100%",
            background: "#212124",
            borderRadius: 2,
            transition: "width 0.2s ease",
          }}
        />
      </div>
      <div className="mt-2 flex justify-between gap-4">
        <span className="font-sf max-w-[45%] text-[11px] leading-4 text-[rgba(4,4,19,0.55)]">
          {question.left}
        </span>
        <span className="font-sf max-w-[45%] text-right text-[11px] leading-4 text-[rgba(4,4,19,0.55)]">
          {question.right}
        </span>
      </div>
    </div>
  );
}

function FeedbackTextColumn({
  title,
  entries,
}: {
  title: string;
  entries: { name: string; text: string }[];
}) {
  return (
    <div className={BLOCK_CARD_CLASS}>
      <h3 className="font-sf text-lg font-bold leading-6 tracking-[0.38px] text-[rgba(3,3,6,0.88)]">
        {title}
      </h3>
      <div className="flex flex-col gap-3">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <article key={`${title}-${index}`} className="rounded-xl bg-white p-4">
              <p className="font-sf text-[11px] font-medium uppercase tracking-[0.04em] text-[rgba(4,4,19,0.55)]">
                {entry.name}
              </p>
              <p className="font-sf mt-2 text-sm leading-5 text-[rgba(3,3,6,0.88)]">
                {entry.text}
              </p>
            </article>
          ))
        ) : (
          <p className="font-sf text-sm leading-5 text-[rgba(4,4,19,0.55)]">
            Ответов пока нет.
          </p>
        )}
      </div>
    </div>
  );
}

export function FeedbackTab({ designerId }: { designerId: string }) {
  const [responses, setResponses] = useState<QuestionnaireResponseWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<
    Record<FeedbackGroup["key"], boolean>
  >({
    mentorship: true,
    processes: true,
    communication: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadResponses() {
      const supabase = createClient();
      const { data, error: loadError } = await supabase
        .from("questionnaire_responses")
        .select("*, questionnaire_answers(*)")
        .eq("designer_id", designerId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (loadError) {
        setError("Не удалось загрузить обратную связь.");
        setResponses([]);
        setLoading(false);
        return;
      }

      setResponses((data ?? []) as QuestionnaireResponseWithAnswers[]);
      setLoading(false);
    }

    void loadResponses();

    return () => {
      isMounted = false;
    };
  }, [designerId]);

  const textColumns = useMemo(() => {
    const getName = (response: QuestionnaireResponseRow) =>
      response.respondent_name?.trim() || "Аноним";

    return {
      startDoing: responses
        .map((response) => {
          const textAnswers = buildTextAnswerMap(response.questionnaire_answers);
          const text = textAnswers.get("start_doing") ?? response.start_doing?.trim() ?? "";
          return {
            name: getName(response),
            text,
          };
        })
        .filter((entry) => entry.text),
      stopDoing: responses
        .map((response) => {
          const textAnswers = buildTextAnswerMap(response.questionnaire_answers);
          const text = textAnswers.get("stop_doing") ?? response.stop_doing?.trim() ?? "";
          return {
            name: getName(response),
            text,
          };
        })
        .filter((entry) => entry.text),
      continueDoing: responses
        .map((response) => {
          const textAnswers = buildTextAnswerMap(response.questionnaire_answers);
          const text =
            textAnswers.get("continue_doing") ?? response.continue_doing?.trim() ?? "";
          return {
            name: getName(response),
            text,
          };
        })
        .filter((entry) => entry.text),
    };
  }, [responses]);

  if (loading) {
    return (
      <p className="mt-10 font-sf text-sm text-[rgba(4,4,19,0.55)]">
        Загрузка обратной связи...
      </p>
    );
  }

  if (error) {
    return (
      <p className="mt-10 font-sf text-sm text-[#E53535]" role="alert">
        {error}
      </p>
    );
  }

  if (responses.length === 0) {
    return (
      <p className="mt-10 font-sf text-sm text-[rgba(4,4,19,0.55)]">
        Обратная связь пока не собрана. Отправьте ссылку на опросник коллегам.
      </p>
    );
  }

  return (
    <section className="mt-10" data-designer-id={designerId}>
      <div className="flex flex-col gap-6">
        {FEEDBACK_GROUPS.map((group) => (
          <section key={group.key} className={BLOCK_CARD_CLASS}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 text-left"
              onClick={() =>
                setOpenSections((current) => ({
                  ...current,
                  [group.key]: !current[group.key],
                }))
              }
              aria-expanded={openSections[group.key]}
            >
              <div>
                <h3 className="font-sf text-lg font-bold leading-6 tracking-[0.38px] text-[rgba(3,3,6,0.88)]">
                  {group.title}
                </h3>
                <p className="font-sf mt-1 text-sm leading-5 text-[rgba(4,4,19,0.55)]">
                  Средние оценки по вопросам блока
                </p>
              </div>
              <IconChevronDown
                className={`shrink-0 text-[rgba(4,4,19,0.55)] transition-transform ${
                  openSections[group.key] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections[group.key] ? (
              <div className="flex flex-col gap-3">
                {group.questions.map((question) => (
                  <QuestionScoreRow
                    key={question.key}
                    question={question}
                    average={averageForQuestion(responses, question.key)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-sf text-lg font-bold leading-6 tracking-[0.38px] text-[rgba(3,3,6,0.88)]">
          Что говорит команда
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <FeedbackTextColumn title="Начать делать" entries={textColumns.startDoing} />
          <FeedbackTextColumn title="Прекратить" entries={textColumns.stopDoing} />
          <FeedbackTextColumn title="Продолжать" entries={textColumns.continueDoing} />
        </div>
      </section>
    </section>
  );
}
