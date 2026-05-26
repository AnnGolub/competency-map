"use client";

import Image from "next/image";
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
  iconSrc: string;
  questions: readonly ScoreQuestion[];
};

const FEEDBACK_GROUPS: readonly FeedbackGroup[] = [
  {
    key: "mentorship",
    title: "Менторство",
    iconSrc: "/icons/Ranking.svg",
    questions: MENTORSHIP_QUESTIONS,
  },
  {
    key: "processes",
    title: "Процессы",
    iconSrc: "/icons/Activity.svg",
    questions: PROCESSES_QUESTIONS,
  },
  {
    key: "communication",
    title: "Коммуникация",
    iconSrc: "/icons/Emoji-sad.svg",
    questions: COMMUNICATION_QUESTIONS,
  },
] as const;

const SECTION_CARD_STYLE = {
  background: "#1E2130",
  borderRadius: "24px",
  border: "1px solid #2A2D3A",
} as const;

function buildAnswerMap(answers: QuestionnaireAnswerRow[] | null) {
  return new Map((answers ?? []).map((answer) => [answer.question_key, Number(answer.score)]));
}

function averageQuestionScores(
  responses: QuestionnaireResponseWithAnswers[],
  keys: readonly string[]
) {
  const values = responses.flatMap((response) => {
    const answerMap = buildAnswerMap(response.questionnaire_answers);
    return keys
      .map((key) => answerMap.get(key))
      .filter((score): score is number => typeof score === "number");
  });

  return averageScore(values);
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

function MetricSummaryCard({
  title,
  iconSrc,
  average,
  responseCount,
}: {
  title: string;
  iconSrc: string;
  average: number | null;
  responseCount: number;
}) {
  const progress = average === null ? 0 : Math.min(1, average / 10);
  const size = 44;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <article
      className="flex min-w-0 items-center justify-between gap-4 p-6"
      style={SECTION_CARD_STYLE}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3E7BFA] to-[#6600CC]">
          <Image src={iconSrc} alt="" width={24} height={24} className="shrink-0" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-white">{title}</p>
          <p className="text-sm leading-5 text-app-placeholder">
            На основе {responseCount} ответов
          </p>
        </div>
      </div>
      <div className="relative h-11 w-11 shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2A2D3A"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#3E7BFA"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-white">
          {average === null ? "—" : average.toFixed(1)}
        </span>
      </div>
    </article>
  );
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
    <div
      className="rounded-2xl border border-[#2A2D3A] bg-[#151826] p-4"
      style={{ marginTop: "12px" }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-6 text-white">{question.text}</p>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-white">
          {average === null ? "—" : `${average.toFixed(1)}/10`}
        </span>
      </div>
      <div
        style={{
          marginTop: "12px",
          height: "8px",
          background: "#2A2D3A",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width,
            height: "100%",
            background: "#2F6FED",
            borderRadius: "999px",
            transition: "width 0.2s ease",
          }}
        />
      </div>
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <span className="max-w-[45%] text-xs leading-5 text-app-placeholder">
          {question.left}
        </span>
        <span className="max-w-[45%] text-right text-xs leading-5 text-app-placeholder">
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
    <div style={SECTION_CARD_STYLE} className="p-6">
      <h3 className="text-base font-semibold leading-6 text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <article
              key={`${title}-${index}`}
              className="rounded-2xl border border-[#2A2D3A] bg-[#151826] p-4"
            >
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-app-placeholder">
                {entry.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-white">{entry.text}</p>
            </article>
          ))
        ) : (
          <p className="text-sm leading-6 text-app-placeholder">Ответов пока нет.</p>
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

  const summaryCards = useMemo(
    () =>
      FEEDBACK_GROUPS.map((group) => ({
        ...group,
        average: averageQuestionScores(
          responses,
          group.questions.map((question) => question.key)
        ),
      })),
    [responses]
  );

  const textColumns = useMemo(() => {
    const getName = (response: QuestionnaireResponseRow) =>
      response.respondent_name?.trim() || "Аноним";

    return {
      startDoing: responses.map((response) => ({
        name: getName(response),
        text: response.start_doing,
      })),
      stopDoing: responses.map((response) => ({
        name: getName(response),
        text: response.stop_doing,
      })),
      continueDoing: responses.map((response) => ({
        name: getName(response),
        text: response.continue_doing,
      })),
    };
  }, [responses]);

  if (loading) {
    return (
      <p style={{ marginTop: "40px", color: "#8F90A6" }}>Загрузка обратной связи...</p>
    );
  }

  if (error) {
    return (
      <p style={{ marginTop: "40px", color: "#F97066" }} role="alert">
        {error}
      </p>
    );
  }

  if (responses.length === 0) {
    return (
      <p style={{ marginTop: "40px", color: "#8F90A6" }}>
        Обратная связь пока не собрана. Отправьте ссылку на опросник коллегам.
      </p>
    );
  }

  return (
    <section style={{ marginTop: "40px" }} data-designer-id={designerId}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <MetricSummaryCard
            key={card.key}
            title={card.title}
            iconSrc={card.iconSrc}
            average={card.average}
            responseCount={responses.length}
          />
        ))}
      </div>

      <div className="mt-10 space-y-6">
        {FEEDBACK_GROUPS.map((group) => (
          <section key={group.key} style={SECTION_CARD_STYLE} className="p-6">
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
                <h3 className="text-base font-semibold leading-6 text-white">{group.title}</h3>
                <p className="mt-1 text-sm leading-5 text-app-placeholder">
                  Средние оценки по вопросам блока
                </p>
              </div>
              <IconChevronDown
                className={`shrink-0 text-app-placeholder transition-transform ${
                  openSections[group.key] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections[group.key] ? (
              <div className="mt-4">
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
        <h2 className="text-base font-semibold leading-6 text-white">Что говорит команда</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <FeedbackTextColumn title="Начать делать" entries={textColumns.startDoing} />
          <FeedbackTextColumn title="Прекратить" entries={textColumns.stopDoing} />
          <FeedbackTextColumn title="Продолжать" entries={textColumns.continueDoing} />
        </div>
      </section>
    </section>
  );
}
