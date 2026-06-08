"use client";

import { useEffect, useMemo, useState } from "react";
import {
  submitQuestionnaireByToken,
  type SubmitQuestionnairePayload,
} from "@/app/actions/questionnaire";
import {
  COMMUNICATION_QUESTIONS,
  MENTORSHIP_QUESTIONS,
  PROCESSES_QUESTIONS,
  STEPS,
  type QuestionnaireScoreKey,
  type QuestionnaireStep,
} from "@/lib/questionnaire";

type ScoreState = Partial<Record<QuestionnaireScoreKey, number>>;

type QuestionnaireFormState = {
  respondentName: string;
  context: string;
  mentorshipFollowup: string;
  processesFollowup: string;
  communicationFollowup: string;
  startDoing: string;
  stopDoing: string;
  continueDoing: string;
  scores: ScoreState;
};

const PRIMARY_BUTTON =
  "font-sf inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#212124] px-5 py-1 text-base font-medium leading-6 text-[rgba(255,255,255,0.94)] transition-opacity hover:opacity-90 disabled:opacity-50";

const SECONDARY_BUTTON =
  "font-sf inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[rgba(15,25,55,0.10)] px-5 py-1 text-base font-medium leading-6 text-[rgba(3,3,6,0.88)] backdrop-blur-[40px] transition-opacity hover:opacity-90 disabled:opacity-50";

const FIELD_LABEL =
  "font-sf mb-1.5 block text-sm leading-[18px] text-[rgba(4,4,19,0.55)]";

const INPUT_CLASS =
  "font-sf w-full rounded-xl border-0 bg-[#F2F3F5] px-4 py-3.5 text-base leading-6 text-[rgba(3,3,6,0.88)] outline-none placeholder:text-[rgba(4,4,19,0.55)]";

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[120px] resize-y`;

const STEP_TITLE =
  "font-sf text-[22px] font-bold leading-[26px] tracking-[0.2px] text-[rgba(3,3,6,0.88)]";

const QUESTION_CARD =
  "flex flex-col gap-4 rounded-[24px] bg-[#F2F3F5] p-6";

function ScoreButtons({
  value,
  onChange,
  labelLeft,
  labelRight,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
  labelLeft: string;
  labelRight: string;
}) {
  return (
    <div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
          const selected = value === n;

          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`font-sf inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm leading-5 transition-colors ${
                selected
                  ? "border-0 bg-[#212124] text-[rgba(255,255,255,0.94)]"
                  : "border border-[#EDEEF0] bg-white text-[rgba(3,3,6,0.88)]"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-4">
        <span className="font-sf max-w-[45%] text-[11px] leading-4 text-[rgba(4,4,19,0.55)]">
          {labelLeft}
        </span>
        <span className="font-sf max-w-[45%] text-right text-[11px] leading-4 text-[rgba(4,4,19,0.55)]">
          {labelRight}
        </span>
      </div>
    </div>
  );
}

function hasLowScore(
  questions: readonly { key: QuestionnaireScoreKey }[],
  scores: ScoreState
) {
  return questions.some((question) => {
    const value = scores[question.key];
    return value !== undefined && value <= 4;
  });
}

function areAllScoresFilled(
  questions: readonly { key: QuestionnaireScoreKey }[],
  scores: ScoreState
) {
  return questions.every((question) => scores[question.key] !== undefined);
}

function StatusCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] bg-[#F2F3F5] p-8">
      <h2 className="font-sf text-[30px] font-bold leading-9 tracking-[0.1px] text-[rgba(3,3,6,0.88)]">
        {title}
      </h2>
      <p className="font-sf mt-3 text-base leading-6 text-[rgba(4,4,19,0.55)]">
        {description}
      </p>
    </div>
  );
}

export function QuestionnaireForm({
  token,
  designerName,
}: {
  token: string;
  designerName: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmittedInBrowser, setAlreadySubmittedInBrowser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionnaireFormState>({
    respondentName: "",
    context: "",
    mentorshipFollowup: "",
    processesFollowup: "",
    communicationFollowup: "",
    startDoing: "",
    stopDoing: "",
    continueDoing: "",
    scores: {},
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAlreadySubmittedInBrowser(
      localStorage.getItem(`questionnaire_done_${token}`) === "true"
    );
  }, [token]);

  const visibleSteps = useMemo(
    () =>
      STEPS.filter((step) => {
        if (step === "mentorship_followup") {
          return hasLowScore(MENTORSHIP_QUESTIONS, form.scores);
        }
        if (step === "processes_followup") {
          return hasLowScore(PROCESSES_QUESTIONS, form.scores);
        }
        if (step === "communication_followup") {
          return hasLowScore(COMMUNICATION_QUESTIONS, form.scores);
        }
        return true;
      }),
    [form.scores]
  );

  useEffect(() => {
    if (stepIndex > visibleSteps.length - 1) {
      setStepIndex(Math.max(visibleSteps.length - 1, 0));
    }
  }, [stepIndex, visibleSteps.length]);

  const currentStep = visibleSteps[stepIndex] ?? "welcome";
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === visibleSteps.length - 1;

  function setScore(questionKey: QuestionnaireScoreKey, value: number) {
    setForm((prev) => ({
      ...prev,
      scores: { ...prev.scores, [questionKey]: value },
    }));
  }

  function updateField<K extends keyof Omit<QuestionnaireFormState, "scores">>(
    key: K,
    value: QuestionnaireFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(step: QuestionnaireStep): string | null {
    if (step === "about" && !form.context.trim()) {
      return "Расскажи, над чем вы работали вместе или где взаимодействовали.";
    }
    if (step === "mentorship" && !areAllScoresFilled(MENTORSHIP_QUESTIONS, form.scores)) {
      return "Поставь оценки на все вопросы про наставничество.";
    }
    if (step === "processes" && !areAllScoresFilled(PROCESSES_QUESTIONS, form.scores)) {
      return "Поставь оценки на все вопросы про процессы.";
    }
    if (
      step === "communication" &&
      !areAllScoresFilled(COMMUNICATION_QUESTIONS, form.scores)
    ) {
      return "Поставь оценки на все вопросы про коммуникацию.";
    }
    if (
      step === "final" &&
      (!form.startDoing.trim() ||
        !form.stopDoing.trim() ||
        !form.continueDoing.trim())
    ) {
      return "Заполни все три обязательных поля на последнем шаге.";
    }
    return null;
  }

  function nextStep() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function prevStep() {
    setError(null);
    if (!isFirstStep) {
      setStepIndex((current) => current - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    const validationError = validateStep("final");
    if (validationError) {
      setError(validationError);
      return;
    }

    const scores = {} as Record<QuestionnaireScoreKey, number>;
    for (const question of [
      ...MENTORSHIP_QUESTIONS,
      ...PROCESSES_QUESTIONS,
      ...COMMUNICATION_QUESTIONS,
    ]) {
      const value = form.scores[question.key];
      if (value === undefined) {
        setError("Заполни все оценки от 1 до 10.");
        return;
      }
      scores[question.key] = value;
    }

    const payload: SubmitQuestionnairePayload = {
      respondentName: form.respondentName,
      context: form.context,
      scores,
      textAnswers: {
        mentorship_followup: form.mentorshipFollowup,
        processes_followup: form.processesFollowup,
        communication_followup: form.communicationFollowup,
        start_doing: form.startDoing,
        stop_doing: form.stopDoing,
        continue_doing: form.continueDoing,
      },
    };

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await submitQuestionnaireByToken(token, payload);
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      localStorage.setItem(`questionnaire_done_${token}`, "true");
      setAlreadySubmittedInBrowser(true);
      setSubmitted(true);
    } catch (submitError) {
      setIsSubmitting(false);
      throw submitError;
    }
  }

  if (submitted) {
    return (
      <StatusCard
        title="Спасибо! Твой фидбэк отправлен 🙌"
        description="Это поможет дизайнеру стать лучше"
      />
    );
  }

  if (alreadySubmittedInBrowser) {
    return (
      <StatusCard
        title="Ты уже оставил фидбэк для этого дизайнера"
        description="Повторная отправка с этого браузера недоступна."
      />
    );
  }

  function renderQuestionStep(
    title: string,
    questions: readonly {
      key: QuestionnaireScoreKey;
      text: string;
      left: string;
      right: string;
    }[]
  ) {
    return (
      <div>
        <h2 className={STEP_TITLE}>{title}</h2>
        <div className="mt-6 flex flex-col gap-5">
          {questions.map((question) => (
            <div key={question.key} className={QUESTION_CARD}>
              <p className="font-sf text-base leading-6 text-[rgba(3,3,6,0.88)]">
                {question.text}
              </p>
              <ScoreButtons
                value={form.scores[question.key]}
                onChange={(value) => setScore(question.key, value)}
                labelLeft={question.left}
                labelRight={question.right}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderContent() {
    if (currentStep === "welcome") {
      return (
        <div>
          <h1 className="font-sf text-[30px] font-bold leading-9 tracking-[0.1px] text-[rgba(3,3,6,0.88)]">
            Обратная связь о {designerName}
          </h1>
          <p className="font-sf mt-4 text-base leading-6 text-[rgba(4,4,19,0.55)]">
            Этот опросник анонимный. Если не захочешь поделиться своим именем — оно
            нигде не появится. Заполни честно — это поможет дизайнеру быть лучше 😉
          </p>
          <button type="button" onClick={nextStep} className={`${PRIMARY_BUTTON} mt-6`}>
            Начать
          </button>
        </div>
      );
    }

    if (currentStep === "about") {
      return (
        <div>
          <h2 className={STEP_TITLE}>Немного контекста</h2>
          <div className="mt-6">
            <label className={FIELD_LABEL}>Представься, пожалуйста (необязательно)</label>
            <input
              value={form.respondentName}
              onChange={(event) => updateField("respondentName", event.target.value)}
              className={INPUT_CLASS}
              placeholder="Твоё имя"
            />
          </div>
          <div className="mt-5">
            <label className={FIELD_LABEL}>
              Расскажи, над чем вы работали вместе или где взаимодействовали?
            </label>
            <textarea
              value={form.context}
              onChange={(event) => updateField("context", event.target.value)}
              className={TEXTAREA_CLASS}
              placeholder="Опиши контекст совместной работы"
            />
          </div>
        </div>
      );
    }

    if (currentStep === "mentorship") {
      return renderQuestionStep("Наставничество", MENTORSHIP_QUESTIONS);
    }

    if (currentStep === "mentorship_followup") {
      return (
        <div>
          <h2 className={STEP_TITLE}>Что хотелось бы улучшить</h2>
          <div className="mt-6">
            <label className={FIELD_LABEL}>
              Где именно были проблемы? Можешь описать конкретную ситуацию?
            </label>
            <textarea
              value={form.mentorshipFollowup}
              onChange={(event) => updateField("mentorshipFollowup", event.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      );
    }

    if (currentStep === "processes") {
      return renderQuestionStep("Процессы и ответственность", PROCESSES_QUESTIONS);
    }

    if (currentStep === "processes_followup") {
      return (
        <div>
          <h2 className={STEP_TITLE}>Контекст по процессам</h2>
          <div className="mt-6">
            <label className={FIELD_LABEL}>
              Вспомни ситуацию, где это повлияло на работу — твою или команды. Что
              произошло?
            </label>
            <textarea
              value={form.processesFollowup}
              onChange={(event) => updateField("processesFollowup", event.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      );
    }

    if (currentStep === "communication") {
      return renderQuestionStep("Коммуникация", COMMUNICATION_QUESTIONS);
    }

    if (currentStep === "communication_followup") {
      return (
        <div>
          <h2 className={STEP_TITLE}>Контекст по коммуникации</h2>
          <div className="mt-6">
            <label className={FIELD_LABEL}>
              Что именно создаёт дискомфорт в коммуникации? Опиши, если можешь
            </label>
            <textarea
              value={form.communicationFollowup}
              onChange={(event) =>
                updateField("communicationFollowup", event.target.value)
              }
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 className={STEP_TITLE}>Финальные вопросы</h2>
        <div className="mt-6 flex flex-col gap-5">
          <div>
            <label className={FIELD_LABEL}>
              Что этому человеку стоит начать делать — чего он/она пока не делает?
            </label>
            <textarea
              value={form.startDoing}
              onChange={(event) => updateField("startDoing", event.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
          <div>
            <label className={FIELD_LABEL}>
              Что стоит прекратить — что мешает ему/ей или команде?
            </label>
            <textarea
              value={form.stopDoing}
              onChange={(event) => updateField("stopDoing", event.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
          <div>
            <label className={FIELD_LABEL}>
              Что точно нужно продолжать — в чём его/её реальная сила?
            </label>
            <textarea
              value={form.continueDoing}
              onChange={(event) => updateField("continueDoing", event.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentStep !== "welcome" ? (
        <p className="font-sf mb-4 text-sm leading-5 text-[rgba(4,4,19,0.55)]">
          Шаг {stepIndex + 1} из {visibleSteps.length}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-lg border border-[#E53535]/30 bg-[#E53535]/10 px-3 py-2 text-sm text-[#E53535]">
          {error}
        </p>
      ) : null}

      {renderContent()}

      {currentStep !== "welcome" ? (
        <div className="mt-6 flex gap-4">
          {!isFirstStep ? (
            <button type="button" onClick={prevStep} className={SECONDARY_BUTTON}>
              Назад
            </button>
          ) : null}

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={PRIMARY_BUTTON}
            >
              Отправить
            </button>
          ) : (
            <button type="button" onClick={nextStep} className={PRIMARY_BUTTON}>
              Далее
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
