import { createClient } from "@/lib/supabase/server";
import { filterCompetenciesForRole } from "@/lib/competency-utils";
import type {
  Competency,
  CompetencyItem,
  Designer,
  Score,
} from "@/lib/competency-utils";

export type DesignerWithAverage = Designer & {
  averageScore: number | null;
};

export async function fetchDesignersWithAverages(): Promise<
  DesignerWithAverage[]
> {
  const supabase = createClient();

  const [{ data: designers, error: designersError }, { data: scores, error: scoresError }] =
    await Promise.all([
      supabase.from("designers").select("*").order("name"),
      supabase.from("scores").select("designer_id, score"),
    ]);

  if (designersError) throw designersError;
  if (scoresError) throw scoresError;

  const sums = new Map<string, { total: number; count: number }>();
  for (const row of scores ?? []) {
    const prev = sums.get(row.designer_id) ?? { total: 0, count: 0 };
    prev.total += Number(row.score);
    prev.count += 1;
    sums.set(row.designer_id, prev);
  }

  return (designers ?? []).map((d) => {
    const agg = sums.get(d.id);
    const averageScore =
      agg && agg.count > 0
        ? Math.round((agg.total / agg.count) * 10) / 10
        : null;
    return { ...d, averageScore };
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
    .select("*")
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
