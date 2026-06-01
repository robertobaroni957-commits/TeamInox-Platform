export interface Round {
  id: number;
  wtrl_id: number;
  season_code?: string;
  round_number?: number;
  name: string;
  starts_at?: string;
  ends_at?: string;
  sync_state?: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  series_id: number; // Kept for backward compatibility
  date: string;
  world: string;
  route: string;
  format?: string;
  distance?: number;
  elevation?: number;
  powerups?: string;
  strategy_details?: string | {
    fal_segments: string[];
    fts_segments: string[];
    powerup_details?: string;
  };
}

export interface Team {
  id: number;
  name: string;
  category: string;
  division?: string;
  wtrl_team_id?: number;
  race_pass_url?: string;
}

export interface Athlete {
  zwid: number;
  name: string;
  category: string;
  avatar_url?: string;
  role?: string;
  status?: string; // availability status
}

export interface TimeSlot {
  id: string;
  display_name: string;
  day_of_week: number;
  start_time: string;
}

export interface TimePreference {
  time_slot_id: string;
  preference_level: number;
}

export interface AvailabilityData {
  timeSlots: TimeSlot[];
  preferences: TimePreference[];
  rounds: (Round & { status?: string })[];
  intent?: boolean;
  error?: string;
}

export interface LineupEntry {
  round_id: number;
  race_id?: number; // Added to support race-based lineup context
  team_id: number;
  athlete_id: number;
  role: 'starter' | 'reserve';
  status: 'pending' | 'confirmed' | 'rejected';
  athlete_name?: string;
  athlete_avatar?: string;
  team_name?: string;
}

export interface RaceResult {
  zwid: number;
  name: string;
  team: string;
  time: number;
  points_total: number;
}

export interface RoundDraft {
  round_number: number;
  name: string;
  starts_at: string;
  ends_at: string;
  season_code?: string;
  status: "CREATED";
}

export interface Season {
  id: number;
  code: string;
  name: string;
}

export interface Series {
  id: number;
  name: string;
  is_active?: boolean; // Deprecated
  total_rounds?: number;
  external_season_id?: number;
}

export interface InoxEvent {
  id: number;
  name: string;
  day_of_week: string;
  time: string;
  description?: string;
  zwift_link?: string;
  strava_segment_id?: string;
  category?: string;
  is_active?: boolean;
}

export interface UserData {
  id: number;
  zwid: number;
  zwift_power_id?: number;
  name: string;
  username: string;
  email?: string;
  role: 'admin' | 'moderator' | 'captain' | 'user' | 'guest' | string;
  team?: string;
  base_category?: string;
  gender?: string;
  avatar_url?: string;
  created_at: string;
  zrl_teams?: string;
}
