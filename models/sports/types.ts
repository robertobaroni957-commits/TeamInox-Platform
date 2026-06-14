export interface Season { id: number; code: string; name: string; }
export interface Round { id: number; season_id: number; name: string; starts_at?: string; }
export interface Race { id: number; round_id: number; name: string; race_type?: string; }
export interface Team { id: number; name: string; category?: string; }
export interface Rider { id: number; zwid: number; name: string; }

export interface TeamRaceResult { race_id: number; team_id: number; position: number; points: number; }
export interface RiderRaceResult { race_id: number; rider_id: number; team_id: number; position: number; time: number; points: number; }

export interface GraphEdge {
    source_type: 'season' | 'round' | 'race' | 'team' | 'rider';
    source_id: number;
    target_type: 'season' | 'round' | 'race' | 'team' | 'rider';
    target_id: number;
    edge_type: string;
}
