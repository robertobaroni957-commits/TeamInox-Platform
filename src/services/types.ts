export interface Round {
  id: number;
  series_id: number;
  name: string;
  date: string;
  world: string;
  route: string;
}

export interface Team {
  id: number;
  name: string;
  category: string;
  division?: string;
}

export interface Athlete {
  zwid: number;
  name: string;
  category: string;
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
}

export interface LineupEntry {
  round_id: number;
  team_id: number;
  athlete_id: number;
  role: 'starter' | 'reserve';
  status: 'pending' | 'confirmed' | 'rejected';
  athlete_name?: string;
  team_name?: string;
}

export interface RaceResult {
  zwid: number;
  name: string;
  team: string;
  time: number;
  points_total: number;
}

export interface Series {
  id: number;
  name: string;
  is_active: boolean;
  total_rounds?: number;
}

export interface InoxEvent {
  id: number;
  name: string;
  day_of_week: string;
  time: string;
  description?: string;
  zwift_link?: string;
  category?: string;
  is_active?: boolean;
}
