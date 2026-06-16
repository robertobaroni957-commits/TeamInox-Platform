import { RaceAnalysisInput } from '../../types/raceNarrative';

/**
 * Transforms raw backend race JSON into the canonical RaceAnalysisInput structure.
 */
export function buildRaceAnalysisInput(raw: any): RaceAnalysisInput {
  // 1. Metadata
  const metadata = {
    race_id: raw.id ?? 0,
    race_name: raw.name ?? 'Unknown Race',
    date: raw.date ?? new Date().toISOString(),
    track_name: raw.track?.name ?? 'Unknown Track',
    track_conditions: (raw.track?.conditions === 'wet' || raw.track?.conditions === 'mixed') 
        ? raw.track.conditions 
        : 'dry'
  };

  // 2. Context
  const context = {
    round_id: raw.round?.id ?? 0,
    round_name: raw.round?.name ?? 'Unknown Round',
    season_code: raw.season?.code ?? '0000',
    team_id: raw.team?.id ?? 0,
    team_name: raw.team?.name ?? 'Unknown Team'
  };

  // 3. Results
  const results = (raw.results ?? []).map((d: any) => ({
    driver_id: d.id ?? 0,
    driver_name: d.name ?? 'Unknown Driver',
    position: d.position ?? 99,
    time_gap: d.gap ?? null,
    status: (d.status === 'dnf' || d.status === 'dsq') ? d.status : 'finished',
    points: d.points ?? 0
  }));

  // 4. Events & Normalization
  const eventTypeMap: Record<string, 'overtake' | 'incident' | 'penalty' | 'fastest_lap'> = {
    overtaking: 'overtake',
    incident: 'incident',
    penalty: 'penalty',
    fastest_lap: 'fastest_lap'
  };

  const events = (raw.events ?? []).map((e: any) => ({
    timestamp: e.timestamp ?? 0,
    type: eventTypeMap[e.type] ?? 'incident',
    driver_id: e.driver_id ?? 0,
    description: e.description ?? ''
  }));

  // 5. Aggregates (Derived)
  const avg_power = (raw.telemetry?.power ?? []).reduce((a: number, b: number) => a + b, 0) / 
                    (raw.telemetry?.power?.length || 1);

  const total_incidents = events.filter(e => e.type === 'incident').length;

  // Assuming raw.team_position_history exists, otherwise default
  const team_position_trend = (raw.team_position_history ?? [results[0]?.position ?? 0]);

  return {
    metadata,
    context,
    results,
    events,
    aggregates: {
      avg_power,
      total_incidents,
      team_position_trend
    }
  };
}
