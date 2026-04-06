// src/services/roundService.ts

export interface Round {
  id: number;
  series_id: number;
  name: string;
  date: string | null;
  world: string | null;
  route: string | null;
  status: string;
  team_count: number;
  lineup_count: number;
  availability_count: number;
}

export interface Series {
  id: number;
  name: string;
  external_season_id: number | null;
  is_active: boolean;
}

export interface RoundStatusResponse {
  success: boolean;
  series: Series | null;
  rounds: Round[];
  total_system_teams: number;
  message?: string;
  error?: string;
}

const API_BASE = "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('inox_token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const roundService = {
  async getStatus(): Promise<RoundStatusResponse> {
    const res = await fetch(`${API_BASE}/round-status`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async initSeason(year: number, roundIndex: number): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/round-init`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ year, round_index: roundIndex }),
    });
    return await res.json();
  },

  async resetRound(round_id: number, confirm: boolean): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/round-reset`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ round_id, confirm }),
    });
    return await res.json();
  }
};
