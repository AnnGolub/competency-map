import { createClient } from "@/lib/supabase/server";
import { BLOCK_ORDER, filterCompetenciesForRole } from "@/lib/competency-utils";
import type { CompetencyBlock } from "@/types/database";
import type {
  Competency,
  CompetencyItem,
  Designer,
  Score,
} from "@/lib/competency-utils";

export type CompetencyExportColumn = {
  id: string;
  title: string;
};

export type DesignerWithAverage = Designer & {
  averageScore: number | null;
  competencyScoresById: Record<string, number | null>;
  lastReviewedAt: string | null;
};

export type DesignersWithAveragesResult = {
  designers: DesignerWithAverage[];
  competencyExportColumns: CompetencyExportColumn[];
};

const COMPETENCY_COLUMNS =
  "id, block, title, description, expected_junior, expected_middle, expected_senior, expected_lead, expected_pre_lead, indicators_1, indicators_2, indicators_3, indicators_4" as const;

function blockSortIndex(block: CompetencyBlock): number {
  const i = BLOCK_ORDER.indexOf(block);
  return i === -1 ? 999 : i;
}

export async function fetchDesignersWithAverages(): Promise<
  DesignersWithAveragesResult
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
    supabase.from("competencies").select("id, block, title"),
  ]);

  if (designersError) throw designersError;
  if (scoresError) throw scoresError;
  if (competenciesError) throw competenciesError;

  const competencyExportColumns: CompetencyExportColumn[] = (
    competencyRows ?? []
  )
    .slice()
    .sort((a, b) => {
      const br =
        blockSortIndex(a.block as CompetencyBlock) -
        blockSortIndex(b.block as CompetencyBlock);
      if (br !== 0) return br;
      return (a.title ?? "").localeCompare(b.title ?? "", "ru");
    })
    .map((r) => ({ id: r.id, title: r.title ?? "" }));

  const scoresByDesigner = new Map<string, Map<string, number>>();
  const totals = new Map<string, { sum: number; count: number }>();
  const lastReviewedAt = new Map<string, string | null>();

  for (const d of designers ?? []) {
    totals.set(d.id, { sum: 0, count: 0 });
    lastReviewedAt.set(d.id, null);
    scoresByDesigner.set(d.id, new Map());
  }

  for (const row of scores ?? []) {
    const designerId = row.designer_id;
    const scoreNum = Number(row.score);

    let map = scoresByDesigner.get(designerId);
    if (!map) {
      map = new Map();
      scoresByDesigner.set(designerId, map);
    }
    map.set(row.competency_id, scoreNum);

    let tot = totals.get(designerId);
    if (!tot) {
      tot = { sum: 0, count: 0 };
      totals.set(designerId, tot);
    }
    tot.sum += scoreNum;
    tot.count += 1;

    const ra = row.reviewed_at as string;
    const prev = lastReviewedAt.get(designerId);
    if (
      prev === undefined ||
      !prev ||
      new Date(ra).getTime() > new Date(prev).getTime()
    ) {
      lastReviewedAt.set(designerId, ra);
    }
  }

  const designersWithAverages: DesignerWithAverage[] = (designers ?? []).map(
    (d) => {
      const map = scoresByDesigner.get(d.id) ?? new Map();
      const competencyScoresById: Record<string, number | null> = {};
      for (const col of competencyExportColumns) {
        competencyScoresById[col.id] = map.has(col.id)
          ? (map.get(col.id) as number)
          : null;
      }

      const tot = totals.get(d.id) ?? { sum: 0, count: 0 };
      const averageScore =
        tot.count > 0
          ? Math.round((tot.sum / tot.count) * 10) / 10
          : null;

      return {
        ...d,
        averageScore,
        competencyScoresById,
        lastReviewedAt: lastReviewedAt.get(d.id) ?? null,
      };
    }
  );

  return { designers: designersWithAverages, competencyExportColumns };
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
