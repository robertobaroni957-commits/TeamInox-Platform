export interface RaceAnalysisInput {
  metadata: {
    race_id: number;
    race_name: string;
    date: string; // ISO format
    track_name: string;
    track_conditions: 'dry' | 'wet' | 'mixed';
  };
  context: {
    round_id: number;
    round_name: string;
    season_code: string;
    team_id: number;
    team_name: string;
  };
  results: {
    driver_id: number;
    driver_name: string;
    team_name?: string;
    position: number;
    time_gap: number | null; // in seconds, null if leader
    status: 'finished' | 'dnf' | 'dsq';
    points: number;
  }[];
  events: {
    timestamp: number; // race seconds
    type: 'overtake' | 'incident' | 'penalty' | 'fastest_lap';
    driver_id: number;
    description: string;
  }[];
  aggregates: {
    avg_power: number;
    total_incidents: number;
    team_position_trend: number[]; // e.g., [-1, 0, 1]
  };
}

export interface RaceNarrativeOutput {
  title: string;
  summary: string;
  highlights: string[];
  insights: {
    category: 'performance' | 'strategy' | 'incidents';
    text: string;
  }[];
  metadata: {
    grounded: boolean;
    model_version: string;
  };
}
