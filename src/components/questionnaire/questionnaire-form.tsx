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

const CONTAINER_STYLE = {
  maxWidth: "818px",
} as const;

const INPUT_STYLE = {
  width: "100%",
  background: "#3E4153",
  border: "1px solid #4A4D5E",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "16px",
  lineHeight: "24px",
  color: "#ffffff",
  outline: "none",
} as const;

const TEXTAREA_STYLE = {
  ...INPUT_STYLE,
  minHeight: "120px",
  resize: "vertical" as const,
} as const;

const SECONDARY_BUTTON_STYLE = {
  background: "#3E4153",
  color: "#fff",
  borderRadius: "12px",
  padding: "12px 24px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: 500,
} as const;

const PRIMARY_BUTTON_STYLE = {
  background: "#2F6FED",
  color: "#fff",
  borderRadius: "12px",
  padding: "12px 24px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: 500,
} as const;

const QUESTION_CARD_STYLE = {
  background: "#252732",
  borderRadius: "24px",
  padding: "24px",
} as const;

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
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginTop: "12px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              border: value === n ? "none" : "1px solid #4A4D5E",
              background: value === n ? "#2F6FED" : "#3E4153",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "#8F90A6",
            maxWidth: "45%",
          }}
        >
          {labelLeft}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "#8F90A6",
            maxWidth: "45%",
            textAlign: "right",
          }}
        >
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
      <div
        style={{
          ...CONTAINER_STYLE,
          background: "#252732",
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        <h2 style={{ fontSize: "30px", lineHeight: "36px", fontWeight: 700 }}>
          Спасибо! Твой фидбэк отправлен 🙌
        </h2>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            color: "#8F90A6",
            marginTop: "12px",
          }}
        >
          Это поможет дизайнеру стать лучше
        </p>
      </div>
    );
  }

  if (alreadySubmittedInBrowser) {
    return (
      <div
        style={{
          ...CONTAINER_STYLE,
          background: "#252732",
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        <h2 style={{ fontSize: "30px", lineHeight: "36px", fontWeight: 700 }}>
          Ты уже оставил фидбэк для этого дизайнера
        </h2>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            color: "#8F90A6",
            marginTop: "12px",
          }}
        >
          Повторная отправка с этого браузера недоступна.
        </p>
      </div>
    );
  }

  function renderContent() {
    if (currentStep === "welcome") {
      return (
        <div style={CONTAINER_STYLE}>
          <h1 style={{ fontSize: "30px", lineHeight: "36px", fontWeight: 700 }}>
            Обратная связь о {designerName}
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: "#8F90A6",
              marginTop: "16px",
            }}
          >
            Этот опросник анонимный. Если не захочешь поделиться своим именем — оно
            нигде не появится. Заполни честно — это поможет дизайнеру быть лучше 😉
          </p>
          <button
            type="button"
            onClick={nextStep}
            style={{ ...PRIMARY_BUTTON_STYLE, marginTop: "24px" }}
          >
            Начать
          </button>
        </div>
      );
    }

    if (currentStep === "about") {
      return (
        <div style={CONTAINER_STYLE}>
          <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
            Немного контекста
          </h2>
          <div style={{ marginTop: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Представься, пожалуйста (необязательно)
            </label>
            <input
              value={form.respondentName}
              onChange={(event) => updateField("respondentName", event.target.value)}
              style={INPUT_STYLE}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Расскажи, над чем вы работали вместе или где взаимодействовали?
            </label>
            <textarea
              value={form.context}
              onChange={(event) => updateField("context", event.target.value)}
              style={TEXTAREA_STYLE}
            />
          </div>
        </div>
      );
    }

    if (currentStep === "mentorship") {
      return (
        <div style={CONTAINER_STYLE}>
          <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
            Наставничество
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>
            {MENTORSHIP_QUESTIONS.map((question) => (
              <div key={question.key} style={QUESTION_CARD_STYLE}>
                <p style={{ fontSize: "16px", lineHeight: "24px" }}>{question.text}</p>
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

    if (currentStep === "mentorship_followup") {
      return (
        <div style={CONTAINER_STYLE}>
          <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
            Что хотелось бы улучшить
          </h2>
          <div style={{ marginTop: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Где именно были проблемы? Можешь описать конкретную ситуацию?
            </label>
            <textarea
              value={form.mentorshipFollowup}
              onChange={(event) => updateField("mentorshipFollowup", event.target.value)}
              style={TEXTAREA_STYLE}
            />
          </div>
        </div>
      );
    }

    if (currentStep === "processes") {
      return (
        <div style={CONTAINER_STYLE}>
          <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
            Процессы и ответственность
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>
            {PROCESSES_QUESTIONS.map((question) => (
              <div key={question.key} style={QUESTION_CARD_STYLE}>
                <p style={{ fontSize: "16px", lineHeight: "24px" }}>{question.text}</p>
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

    if (currentStep === "processes_followup") {
      return (
        <div style={CONTAINER_STYLE}>
          <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
            Контекст по процессам
          </h2>
          <div style={{ marginTop: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Вспомни ситуацию, где это повлияло на работу — твою или команды. Что произошло?
            </label>
            <textarea
              value={form.processesFollowup}
              onChange={(event) => updateField("processesFollowup", event.target.value)}
              style={TEXTAREA_STYLE}
            />
          </div>
        </div>
      );
    }

    if (currentStep === "communication") {
      return (
        <div style={CONTAINER_STYLE}>
          <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
            Коммуникация
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>
            {COMMUNICATION_QUESTIONS.map((question) => (
              <div key={question.key} style={QUESTION_CARD_STYLE}>
                <p style={{ fontSize: "16px", lineHeight: "24px" }}>{question.text}</p>
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

    if (currentStep === "communication_followup") {
      return (
        <div style={CONTAINER_STYLE}>
          <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
            Контекст по коммуникации
          </h2>
          <div style={{ marginTop: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Что именно создаёт дискомфорт в коммуникации? Опиши, если можешь
            </label>
            <textarea
              value={form.communicationFollowup}
              onChange={(event) =>
                updateField("communicationFollowup", event.target.value)
              }
              style={TEXTAREA_STYLE}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={CONTAINER_STYLE}>
        <h2 style={{ fontSize: "22px", lineHeight: "26px", fontWeight: 700 }}>
          Финальные вопросы
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Что этому человеку стоит начать делать — чего он/она пока не делает?
            </label>
            <textarea
              value={form.startDoing}
              onChange={(event) => updateField("startDoing", event.target.value)}
              style={TEXTAREA_STYLE}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Что стоит прекратить — что мешает ему/ей или команде?
            </label>
            <textarea
              value={form.stopDoing}
              onChange={(event) => updateField("stopDoing", event.target.value)}
              style={TEXTAREA_STYLE}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                lineHeight: "18px",
                color: "#8F90A6",
                marginBottom: "6px",
              }}
            >
              Что точно нужно продолжать — в чём его/её реальная сила?
            </label>
            <textarea
              value={form.continueDoing}
              onChange={(event) => updateField("continueDoing", event.target.value)}
              style={TEXTAREA_STYLE}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={CONTAINER_STYLE}>
      {currentStep !== "welcome" ? (
        <p
          style={{
            fontSize: "12px",
            lineHeight: "16px",
            color: "#8F90A6",
            marginBottom: "16px",
          }}
        >
          Шаг {stepIndex + 1} из {visibleSteps.length}
        </p>
      ) : null}

      {error ? (
        <p
          style={{
            marginBottom: "16px",
            border: "1px solid rgba(239,68,68,0.4)",
            background: "rgba(239,68,68,0.1)",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#fca5a5",
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          {error}
        </p>
      ) : null}

      {renderContent()}

      {currentStep !== "welcome" ? (
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          {!isFirstStep ? (
            <button type="button" onClick={prevStep} style={SECONDARY_BUTTON_STYLE}>
              Назад
            </button>
          ) : null}

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                ...PRIMARY_BUTTON_STYLE,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Отправить
            </button>
          ) : (
            <button type="button" onClick={nextStep} style={PRIMARY_BUTTON_STYLE}>
              Далее
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
