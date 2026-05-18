import type {
  CompetencyBlock,
  Database,
  DesignerRole,
} from "@/types/database";

export type Competency = Database["public"]["Tables"]["competencies"]["Row"];
export type Designer = Database["public"]["Tables"]["designers"]["Row"];
export type Score = Database["public"]["Tables"]["scores"]["Row"];
export type CompetencyItem =
  Database["public"]["Tables"]["competency_items"]["Row"];

export const MAX_SCORE = 4;
export const SCORE_STEP = 0.5;
export const SCORE_OPTIONS = Array.from(
  { length: (MAX_SCORE - 1) / SCORE_STEP + 1 },
  (_, i) => 1 + i * SCORE_STEP
);

export const BLOCK_ORDER: CompetencyBlock[] = [
  "leadership",
  "hard",
  "soft",
];

export const BLOCK_LABELS: Record<CompetencyBlock, string> = {
  leadership: "Leadership",
  hard: "Hard skills",
  soft: "Soft skills",
};

export const DESIGNER_ROLES: DesignerRole[] = [
  "junior",
  "middle",
  "senior",
  "lead",
];

export const ROLE_LABELS: Record<DesignerRole, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
};

export function showsLeadershipBlock(role: DesignerRole): boolean {
  return role === "senior" || role === "lead";
}

/** Показывать колонку «Готовится к лиду» (expected_pre_lead). */
export function showPreLeadColumn(role: DesignerRole): boolean {
  return role === "senior" || role === "lead";
}

export function blocksForDesignerRole(role: DesignerRole): CompetencyBlock[] {
  if (showsLeadershipBlock(role)) {
    return BLOCK_ORDER;
  }
  return ["hard", "soft"];
}

export function filterCompetenciesForRole(
  competencies: Competency[],
  role: DesignerRole
): Competency[] {
  const allowed = new Set(blocksForDesignerRole(role));
  return competencies.filter((c) => allowed.has(c.block));
}

export type GapBadge = "ok" | "gap-0.5" | "gap-1.0";

const EXPECTED_BY_ROLE: Record<
  DesignerRole,
  keyof Pick<
    Competency,
    | "expected_junior"
    | "expected_middle"
    | "expected_senior"
    | "expected_lead"
  >
> = {
  junior: "expected_junior",
  middle: "expected_middle",
  senior: "expected_senior",
  lead: "expected_lead",
};

export function getExpectedScore(
  competency: Competency,
  role: DesignerRole
): number {
  return Number(competency[EXPECTED_BY_ROLE[role]]);
}

export function getGapBadge(
  current: number | null,
  expected: number
): { label: string; variant: GapBadge } {
  if (current === null) {
    return { label: "—", variant: "gap-1.0" };
  }
  const gap = expected - current;
  if (gap <= 0) return { label: "в норме", variant: "ok" };
  if (gap <= 0.5) return { label: "−0.5", variant: "gap-0.5" };
  return { label: "−1.0", variant: "gap-1.0" };
}

export function averageScore(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export function formatScore(value: number | null): string {
  if (value === null) return "—";
  return value.toFixed(1);
}

export function progressPercent(score: number | null): number {
  if (score === null) return 0;
  return Math.min(100, (score / MAX_SCORE) * 100);
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export function computeHalfYearGrowth(
  scores: Pick<Score, "score" | "reviewed_at">[]
): number | null {
  if (scores.length === 0) return null;

  const cutoff = Date.now() - SIX_MONTHS_MS;
  const recent: number[] = [];
  const older: number[] = [];

  for (const s of scores) {
    if (s.score === null || s.score === undefined || !s.reviewed_at) continue;
    const t = new Date(s.reviewed_at).getTime();
    const val = Number(s.score);
    if (t >= cutoff) recent.push(val);
    else older.push(val);
  }

  if (recent.length === 0 || older.length === 0) return null;

  const recentAvg = averageScore(recent);
  const olderAvg = averageScore(older);
  if (recentAvg === null || olderAvg === null) return null;

  return Math.round((recentAvg - olderAvg) * 10) / 10;
}

export function countBelowExpected(
  competencies: Competency[],
  scoresByCompetency: Map<string, number>,
  role: DesignerRole
): number {
  return competencies.filter((c) => {
    const current = scoresByCompetency.get(c.id);
    if (current === undefined) return false;
    return current < getExpectedScore(c, role);
  }).length;
}

export type BlindScoreView = {
  leadScore: number | null;
  selfScore: number | null;
  showDual: boolean;
};

export function resolveBlindScores(
  row: Pick<Score, "score" | "self_score">,
  selfReviewCompleted: boolean
): BlindScoreView {
  const leadScore =
    row.score !== null && row.score !== undefined ? Number(row.score) : null;
  const selfScore =
    selfReviewCompleted &&
    row.self_score !== null &&
    row.self_score !== undefined
      ? Number(row.self_score)
      : null;

  return {
    leadScore,
    selfScore,
    showDual: leadScore !== null && selfScore !== null,
  };
}

/** Балл для статистики и гэпа — по оценке лида. */
export function primaryVisibleScore(view: BlindScoreView): number | null {
  return view.leadScore;
}

export function groupByBlock(
  competencies: Competency[]
): Record<CompetencyBlock, Competency[]> {
  const groups: Record<CompetencyBlock, Competency[]> = {
    leadership: [],
    hard: [],
    soft: [],
  };
  for (const c of competencies) {
    groups[c.block].push(c);
  }
  return groups;
}
