export type WinterTourLanguage = 'it' | 'en';
export type WinterTourCategory = 'A' | 'B' | 'C' | 'D' | 'E';
export type WinterTourRankingMode = 'punti' | 'tempo' | 'sprinter' | 'scalatore';

export interface LocalizedValue {
  it: string;
  en: string;
}

export interface WinterTourStage {
  id: number;
  date: string;
  world: LocalizedValue;
  route: LocalizedValue;
  type: LocalizedValue;
  routeLink: string;
  registerLink: string;
  segments: LocalizedValue[];
}

export interface WinterTourCumulativeRider {
  zwid: number;
  name: string;
  tname?: string;
  flag?: string;
  category?: string;
  total?: number;
  time?: number;
  tempo_time?: number;
  pts_sprint?: number;
  pts_kom?: number;
  fin?: number;
  fal?: number;
  fts?: number;
}

export interface WinterTourCumulativeResults {
  races_processed: number;
  max_times_per_race: Array<Record<string, number>>;
  results: Record<string, WinterTourCumulativeRider[]>;
}

export interface WinterTourStageEventDetails {
  event_id?: string;
  url?: string;
  title?: string;
  start_time?: string;
  route?: string;
  distance?: string;
  elevation?: string;
}

export interface WinterTourStageResultRow {
  category: WinterTourCategory;
  name: string;
  tname?: string;
  zwid: number;
  flag?: string;
  punti_pos?: number;
  punti_fal?: number;
  punti_fts?: number;
  punti_fin?: number;
  punti_total?: number;
  punti_time?: number;
  tempo_pos?: number;
  tempo_time?: number;
  tempo_points?: number;
  sprinter_pos?: number;
  sprinter_points?: number;
  sprinter_total_race_points?: number;
  climber_pos?: number;
  climber_points?: number;
  climber_total_race_points?: number;
}

export interface WinterTourStageResultsFile {
  event_details?: WinterTourStageEventDetails;
  race_results: WinterTourStageResultRow[];
}

export interface WinterTourRankingRow {
  zwid: number;
  name: string;
  tname: string;
  flag?: string;
  totalPoints: number;
  totalTime: number;
  sprinterPoints: number;
  climberPoints: number;
  finishPoints: number;
  falPoints: number;
  ftsPoints: number;
}

export interface WinterTourRaceSnapshot {
  stageId: number;
  fileName: string;
  data: WinterTourStageResultsFile;
}

export const winterTourAgeCategoryMap: Record<WinterTourCategory, string> = {
  A: '0-29',
  B: '30-39',
  C: '40-49',
  D: '50-59',
  E: '60+',
};

let cachedStages: WinterTourStage[] = [];

export const winterTourRepository = {
  loadStages: async (): Promise<WinterTourStage[]> => {
    const token = localStorage.getItem('inox_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
    const resp = await fetch('/api/winter-tour/stages', { headers });
    if (!resp.ok) throw new Error("Errore nel caricamento del calendario.");
    cachedStages = await resp.json();
    return cachedStages;
  },
  loadCumulativeResults: async (): Promise<WinterTourCumulativeResults> => {
    const resp = await fetch('/api/winter-tour/rankings?stage_id=cumulative');
    if (!resp.ok) throw new Error("Errore nel caricamento della classifica generale.");
    return await resp.json();
  },
  loadStageResults: async (stageId: number): Promise<WinterTourStageResultsFile> => {
    const resp = await fetch(`/api/winter-tour/rankings?stage_id=${stageId}`);
    if (!resp.ok) throw new Error(`Errore nel caricamento della classifica per la tappa ${stageId}.`);
    return await resp.json();
  },
  listAvailableRaceSnapshots: (): WinterTourRaceSnapshot[] => {
    return cachedStages
      .filter((s) => s.status === 'published')
      .map((s) => ({
        stageId: s.id,
        fileName: `gara_${s.id}_results.json`,
        data: { race_results: [] }
      }));
  },
};

export const getLocalizedValue = (
  value: LocalizedValue | string | undefined,
  language: WinterTourLanguage,
) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value[language] || value.it || value.en;
};

export const formatWinterTourDate = (
  dateString: string,
  language: WinterTourLanguage,
  withTime = true,
) => {
  const formatter = new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

  return formatter.format(new Date(dateString));
};

export const secondsToWinterTourTime = (seconds?: number | null) => {
  if (!seconds || Number.isNaN(seconds) || seconds <= 0) {
    return '--:--:--.---';
  }

  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  const milliseconds = Math.round((safeSeconds - Math.floor(safeSeconds)) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    wholeSeconds,
  ).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
};

export const getWinterTourNextStage = (stages: WinterTourStage[], now = new Date()) =>
  [...stages]
    .filter((stage) => new Date(stage.date).getTime() > now.getTime())
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())[0] ?? null;

export const buildCumulativeRankingRows = (
  cumulativeResults: WinterTourCumulativeResults,
  category: WinterTourCategory,
): WinterTourRankingRow[] =>
  (cumulativeResults.results[category] || []).map((rider) => ({
    zwid: rider.zwid,
    name: rider.name,
    tname: rider.tname || '',
    flag: rider.flag,
    totalPoints: rider.total || 0,
    totalTime: rider.time || rider.tempo_time || 0,
    sprinterPoints: rider.pts_sprint || 0,
    climberPoints: rider.pts_kom || 0,
    finishPoints: rider.fin || 0,
    falPoints: rider.fal || 0,
    ftsPoints: rider.fts || 0,
  }));

export const buildStageRankingRows = (
  stageResults: WinterTourStageResultsFile,
  category: WinterTourCategory,
): WinterTourRankingRow[] =>
  (stageResults.race_results || [])
    .filter((row) => row.category === category)
    .map((row) => ({
      zwid: row.zwid,
      name: row.name,
      tname: row.tname || '',
      flag: row.flag,
      totalPoints: row.punti_total || 0,
      totalTime: row.tempo_time || row.punti_time || 0,
      sprinterPoints: row.sprinter_points || 0,
      climberPoints: row.climber_points || 0,
      finishPoints: row.punti_fin || 0,
      falPoints: row.punti_fal || 0,
      ftsPoints: row.punti_fts || 0,
    }));

export const sortWinterTourRankingRows = (
  rows: WinterTourRankingRow[],
  rankingMode: WinterTourRankingMode,
) => {
  const copy = [...rows];

  if (rankingMode === 'tempo') {
    return copy.sort((first, second) => {
      const firstTime = first.totalTime > 0 ? first.totalTime : Number.POSITIVE_INFINITY;
      const secondTime = second.totalTime > 0 ? second.totalTime : Number.POSITIVE_INFINITY;

      return firstTime - secondTime || second.totalPoints - first.totalPoints;
    });
  }

  if (rankingMode === 'sprinter') {
    return copy
      .filter((row) => row.sprinterPoints > 0)
      .sort((first, second) => second.sprinterPoints - first.sprinterPoints || second.ftsPoints - first.ftsPoints);
  }

  if (rankingMode === 'scalatore') {
    return copy
      .filter((row) => row.climberPoints > 0)
      .sort((first, second) => second.climberPoints - first.climberPoints || second.ftsPoints - first.ftsPoints);
  }

  return copy.sort((first, second) => second.totalPoints - first.totalPoints || first.totalTime - second.totalTime);
};

export const formatWinterTourRankingValue = (
  row: WinterTourRankingRow,
  rankingMode: WinterTourRankingMode,
) => {
  if (rankingMode === 'tempo') {
    return secondsToWinterTourTime(row.totalTime);
  }

  if (rankingMode === 'sprinter') {
    return `${row.sprinterPoints} PTS`;
  }

  if (rankingMode === 'scalatore') {
    return `${row.climberPoints} PTS`;
  }

  return `${row.totalPoints} PTS`;
};