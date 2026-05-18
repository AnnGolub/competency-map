import { createClient } from "@/lib/supabase/server";
import { filterCompetenciesForRole } from "@/lib/competency-utils";
import type { CompetencyBlock } from "@/types/database";
import type {
  Competency,
  CompetencyItem,
  Designer,
  Score,
} from "@/lib/competency-utils";

export type DesignerWithAverage = Designer & {
  averageScore: number | null;
  avgLeadership: number | null;
  avgHard: number | null;
  avgSoft: number | null;
  lastReviewedAt: string | null;
};

const COMPETENCY_COLUMNS =
  "id, block, title, description, expected_junior, expected_middle, expected_senior, expected_lead, expected_pre_lead, indicators_1, indicators_2, indicators_3, indicators_4" as const;

type DesignerAgg = {
  leadership: { sum: number; count: number };
  hard: { sum: number; count: number };
  soft: { sum: number; count: number };
  total: { sum: number; count: number };
  lastReviewedAt: string | null;
};

function emptyAgg(): DesignerAgg {
  return {
    leadership: { sum: 0, count: 0 },
    hard: { sum: 0, count: 0 },
    soft: { sum: 0, count: 0 },
    total: { sum: 0, count: 0 },
    lastReviewedAt: null,
  };
}

function avgFromAgg(a: { sum: number; count: number }): number | null {
  if (a.count === 0) return null;
  return Math.round((a.sum / a.count) * 10) / 10;
}

export async function fetchDesignersWithAverages(): Promise<
  DesignerWithAverage[]
> {
  const supabase = createClient();

  const [
    { data: designers, error: designersError },
    { data: scores, error: scoresError },
    { data: competencyRows, error: competenciesError },
  ] = await Promise.all([
    supabase.from("designers").select("*").order("name"),
    supabase
      .from("scores")
      .select("designer_id, competency_id, score, reviewed_at"),
    supabase.from("competencies").select("id, block"),
  ]);

  if (designersError) throw designersError;
  if (scoresError) throw scoresError;
  if (competenciesError) throw competenciesError;

  const blockByCompetencyId = new Map<string, CompetencyBlock>();
  for (const row of competencyRows ?? []) {
    blockByCompetencyId.set(row.id, row.block as CompetencyBlock);
  }

  const aggs = new Map<string, DesignerAgg>();
  for (const d of designers ?? []) {
    aggs.set(d.id, emptyAgg());
  }

  for (const row of scores ?? []) {
    let agg = aggs.get(row.designer_id);
    if (!agg) {
      agg = emptyAgg();
      aggs.set(row.designer_id, agg);
    }

    const scoreNum = Number(row.score);
    agg.total.sum += scoreNum;
    agg.total.count += 1;

    const block = blockByCompetencyId.get(row.competency_id);
    if (block === "leadership" || block === "hard" || block === "soft") {
      agg[block].sum += scoreNum;
      agg[block].count += 1;
    }

    const ra = row.reviewed_at as string;
    if (
      !agg.lastReviewedAt ||
      new Date(ra).getTime() > new Date(agg.lastReviewedAt).getTime()
    ) {
      agg.lastReviewedAt = ra;
    }
  }

  return (designers ?? []).map((d) => {
    const agg = aggs.get(d.id) ?? emptyAgg();
    return {
      ...d,
      averageScore: avgFromAgg(agg.total),
      avgLeadership: avgFromAgg(agg.leadership),
      avgHard: avgFromAgg(agg.hard),
      avgSoft: avgFromAgg(agg.soft),
      lastReviewedAt: agg.lastReviewedAt,
    };
  });
}

export async function fetchDesigner(id: string): Promise<Designer | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("designers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchCompetencies(): Promise<Competency[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("competencies")
    .select(COMPETENCY_COLUMNS)
    .order("block")
    .order("title");

  if (error) throw error;
  return data ?? [];
}

export async function fetchScoresForDesigner(
  designerId: string
): Promise<Score[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("designer_id", designerId);

  if (error) throw error;
  return data ?? [];
}

export async function fetchCompetencyItems(): Promise<CompetencyItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("competency_items")
    .select("*")
    .order("text");

  if (error) throw error;
  return data ?? [];
}

export type ReviewPageData = {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: Map<string, CompetencyItem[]>;
  scoresByCompetency: Map<string, Score>;
};

export async function fetchReviewPageData(
  designerId: string
): Promise<ReviewPageData | null> {
  const designer = await fetchDesigner(designerId);
  if (!designer) return null;

  const [allCompetencies, items, scores] = await Promise.all([
    fetchCompetencies(),
    fetchCompetencyItems(),
    fetchScoresForDesigner(designerId),
  ]);

  const competencies = filterCompetenciesForRole(
    allCompetencies,
    designer.role
  );

  const itemsByCompetency = new Map<string, CompetencyItem[]>();
  for (const item of items) {
    if (designer.role !== "lead" && item.only_lead) continue;
    const list = itemsByCompetency.get(item.competency_id) ?? [];
    list.push(item);
    itemsByCompetency.set(item.competency_id, list);
  }

  const scoresByCompetency = new Map<string, Score>();
  for (const score of scores) {
    scoresByCompetency.set(score.competency_id, score);
  }

  return {
    designer,
    competencies,
    itemsByCompetency,
    scoresByCompetency,
  };
}
