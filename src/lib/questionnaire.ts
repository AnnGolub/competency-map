export const STEPS = [
  "welcome",
  "about",
  "mentorship",
  "mentorship_followup",
  "processes",
  "processes_followup",
  "communication",
  "communication_followup",
  "final",
] as const;

export type QuestionnaireStep = (typeof STEPS)[number];

type ScoreQuestion = {
  key: string;
  text: string;
  left: string;
  right: string;
};

export const MENTORSHIP_QUESTIONS = [
  {
    key: "mentorship_help",
    text: "Когда ты приходишь к этому человеку с вопросом или проблемой — что обычно происходит?",
    left: "Решает за тебя или отмахивается",
    right: "Помогает разобраться самому, объясняет логику",
  },
  {
    key: "mentorship_feedback",
    text: "Даёт ли он/она конструктивную обратную связь?",
    left: "«Переделай» без объяснений",
    right: "Чётко показывает что не так и почему",
  },
  {
    key: "mentorship_growth",
    text: "Чувствуешь ли ты, что растёшь профессионально, работая рядом с этим человеком?",
    left: "Никак не влияет на мой рост",
    right: "Заметно подтягивает мой уровень",
  },
  {
    key: "mentorship_sharing",
    text: "Делится ли он/она знаниями и контекстом, или всё остаётся у него/неё в голове?",
    left: "Информацию приходится выпытывать",
    right: "Активно делится, документирует решения",
  },
] as const satisfies readonly ScoreQuestion[];

export const PROCESSES_QUESTIONS = [
  {
    key: "processes_status",
    text: "Насколько понятно, в каком статусе находятся задачи этого человека?",
    left: "Непонятно что происходит, пока не спросишь",
    right: "Всегда ясно, где задача и что мешает",
  },
  {
    key: "processes_reaction",
    text: "Когда что-то идёт не по плану (горят сроки, меняются требования) — как он/она реагирует?",
    left: "Теряется, ждёт указаний, создаёт панику",
    right: "Быстро перестраивается, предлагает решение",
  },
  {
    key: "processes_responsibility",
    text: "Берёт ли он/она ответственность за результат задачи целиком, а не только за свою часть?",
    left: "Делает своё и отходит в сторону",
    right: "Доводит до результата, даже если что-то пошло не так",
  },
  {
    key: "processes_feedback_reaction",
    text: "Как он/она реагирует, когда его/её решение отклоняют или просят пересмотреть?",
    left: "Уходит в защиту, не слышит аргументы",
    right: "Разбирается в причине, адаптируется",
  },
] as const satisfies readonly ScoreQuestion[];

export const COMMUNICATION_QUESTIONS = [
  {
    key: "comm_disagree",
    text: "Насколько комфортно с ним/ней не соглашаться или высказывать другую точку зрения?",
    left: "Конфликтует, обижается или давит авторитетом",
    right: "Слышит, обсуждает, не давит",
  },
  {
    key: "comm_atmosphere",
    text: "Как его/её присутствие влияет на атмосферу в команде?",
    left: "Создаёт напряжение или держится отдельно",
    right: "К нему/ней идут, он/она поднимает уровень команды",
  },
  {
    key: "comm_initiative",
    text: "Когда в задаче нет чёткого ТЗ — он/она берёт инициативу или ждёт?",
    left: "Останавливается и ждёт указаний",
    right: "Сам структурирует ситуацию, предлагает путь вперёд",
  },
  {
    key: "comm_argumentation",
    text: "Насколько понятно аргументированы его/её решения и позиции?",
    left: "Сложно понять логику, решения не объясняются",
    right: "Всегда понятно, почему именно так",
  },
] as const satisfies readonly ScoreQuestion[];

export const ALL_SCORE_QUESTIONS = [
  ...MENTORSHIP_QUESTIONS,
  ...PROCESSES_QUESTIONS,
  ...COMMUNICATION_QUESTIONS,
] as const;

export type MentorshipQuestionKey = (typeof MENTORSHIP_QUESTIONS)[number]["key"];
export type ProcessesQuestionKey = (typeof PROCESSES_QUESTIONS)[number]["key"];
export type CommunicationQuestionKey = (typeof COMMUNICATION_QUESTIONS)[number]["key"];
export type QuestionnaireScoreKey =
  | MentorshipQuestionKey
  | ProcessesQuestionKey
  | CommunicationQuestionKey;

export const QUESTIONNAIRE_SCORE_KEYS = ALL_SCORE_QUESTIONS.map(
  (question) => question.key
);
