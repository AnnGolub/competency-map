import { createClient } from "@/lib/supabase/server";
import {
  averageScore,
  BLOCK_ORDER,
  filterCompetenciesForRole,
  groupItemsByCompetency,
} from "@/lib/competency-utils";
import type { CompetencyBlock } from "@/types/database";
import type {
  Competency,
  CompetencyItem,
  Designer,
  ItemScore,
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

const ITEM_COLUMNS =
  "id, competency_id, text, only_lead, expected_junior, expected_middle, expected_senior, expected_lead" as const;

function blockSortIndex(block: CompetencyBlock): number {
  const i = BLOCK_ORDER.indexOf(block);
  return i === -1 ? 999 : i;
}

function aggregateScoresByCompetency(
  itemScores: { competency_item_id: string; score: number | null }[],
  itemToCompetency: Map<string, string>
): Map<string, number[]> {
  const byCompetency = new Map<string, number[]>();
  for (const row of itemScores) {
    if (row.score === null) continue;
    const competencyId = itemToCompetency.get(row.competency_item_id);
    if (!competencyId) continue;
    const list = byCompetency.get(competencyId) ?? [];
    list.push(Number(row.score));
    byCompetency.set(competencyId, list);
  }
  return byCompetency;
}

export async function fetchDesignersWithAverages(): Promise<
  DesignersWithAveragesResult
> {
  const supabase = createClient();

  const [
    { data: designers, error: designersError },
    { data: itemScores, error: itemScoresError },
    { data: competencyRows, error: competenciesError },
    { data: items, error: itemsError },
  ] = await Promise.all([
    supabase.from("designers").select("*").order("name"),
    supabase
      .from("item_scores")
      .select("designer_id, competency_item_id, score, reviewed_at"),
    supabase.from("competencies").select("id, block, title"),
    supabase.from("competency_items").select("id, competency_id"),
  ]);

  if (designersError) throw designersError;
  if (itemScoresError) throw itemScoresError;
  if (competenciesError) throw competenciesError;
  if (itemsError) throw itemsError;

  const itemToCompetency = new Map(
    (items ?? []).map((i) => [i.id, i.competency_id])
  );

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
  const itemTotals = new Map<string, { sum: number; count: number }>();
  const lastReviewedAt = new Map<string, string | null>();

  for (const d of designers ?? []) {
    itemTotals.set(d.id, { sum: 0, count: 0 });
    lastReviewedAt.set(d.id, null);
    scoresByDesigner.set(d.id, new Map());
  }

  const scoresByDesignerItems = new Map<
    string,
    { competency_item_id: string; score: number | null; reviewed_at: string | null }[]
  >();

  for (const row of itemScores ?? []) {
    const designerId = row.designer_id;
    let list = scoresByDesignerItems.get(designerId);
    if (!list) {
      list = [];
      scoresByDesignerItems.set(designerId, list);
    }
    list.push(row);

    if (row.score !== null) {
      let tot = itemTotals.get(designerId);
      if (!tot) {
        tot = { sum: 0, count: 0 };
        itemTotals.set(designerId, tot);
      }
      tot.sum += Number(row.score);
      tot.count += 1;
    }

    if (row.reviewed_at) {
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
  }

  for (const [designerId, rows] of Array.from(scoresByDesignerItems)) {
    const byCompetency = aggregateScoresByCompetency(rows, itemToCompetency);
    const competencyMap = new Map<string, number>();
    for (const [competencyId, values] of Array.from(byCompetency)) {
      const avg = averageScore(values);
      if (avg !== null) competencyMap.set(competencyId, avg);
    }
    scoresByDesigner.set(designerId, competencyMap);
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

      const tot = itemTotals.get(d.id) ?? { sum: 0, count: 0 };
      const averageScoreValue =
        tot.count > 0
          ? Math.round((tot.sum / tot.count) * 10) / 10
          : null;

      return {
        ...d,
        averageScore: averageScoreValue,
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

export async function fetchCompetencyItems(): Promise<CompetencyItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("competency_items")
    .select(ITEM_COLUMNS)
    .order("text");

  if (error) throw error;
  return data ?? [];
}

export async function fetchCompetencyItemsForCompetencies(
  competencyIds: string[]
): Promise<CompetencyItem[]> {
  if (competencyIds.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("competency_items")
    .select(ITEM_COLUMNS)
    .in("competency_id", competencyIds)
    .order("text");

  if (error) throw error;
  return data ?? [];
}

/** Plain object for passing competency items to client components (Map does not serialize). */
export type ItemsByCompetencyRecord = Record<string, CompetencyItem[]>;
export type ScoresByItemRecord = Record<string, ItemScore>;

function itemsMapToRecord(
  map: Map<string, CompetencyItem[]>
): ItemsByCompetencyRecord {
  return Object.fromEntries(map);
}

function scoresMapToRecord(map: Map<string, ItemScore>): ScoresByItemRecord {
  return Object.fromEntries(map);
}

export async function fetchItemScoresForDesigner(
  designerId: string
): Promise<ItemScore[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("item_scores")
    .select("*")
    .eq("designer_id", designerId);

  if (error) throw error;
  return data ?? [];
}

export type ReviewPageData = {
  designer: Designer;
  competencies: Competency[];
  itemsByCompetency: ItemsByCompetencyRecord;
  scoresByItem: ScoresByItemRecord;
};

export async function fetchReviewPageData(
  designerId: string
): Promise<ReviewPageData | null> {
  const designer = await fetchDesigner(designerId);
  if (!designer) return null;

  const allCompetencies = await fetchCompetencies();
  const competencies = filterCompetenciesForRole(
    allCompetencies,
    designer.role
  );
  const competencyIds = competencies.map((c) => c.id);

  const [items, itemScores] = await Promise.all([
    fetchCompetencyItemsForCompetencies(competencyIds),
    fetchItemScoresForDesigner(designerId),
  ]);

  const itemsByCompetency = itemsMapToRecord(
    groupItemsByCompetency(items, designer.role)
  );

  const scoresByItemMap = new Map<string, ItemScore>();
  for (const score of itemScores) {
    scoresByItemMap.set(score.competency_item_id, score);
  }

  return {
    designer,
    competencies,
    itemsByCompetency,
    scoresByItem: scoresMapToRecord(scoresByItemMap),
  };
}
