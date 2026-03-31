import type { 
  Round, 
  Team, 
  Athlete, 
  AvailabilityData, 
  LineupEntry, 
  RaceResult, 
  Series 
} from './types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('inox_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  getSeries: async (): Promise<Series[]> => {
    const res = await fetch(`${API_BASE}/series`, { headers: getHeaders() });
    const data = await res.json();
    return data.series || data;
  },

  getRounds: async (seriesId?: number): Promise<Round[]> => {
    const url = seriesId ? `${API_BASE}/rounds?series_id=${seriesId}` : `${API_BASE}/rounds`;
    const res = await fetch(url, { headers: getHeaders() });
    const data = await res.json();
    return data.rounds || data;
  },

  getTeams: async (): Promise<Team[]> => {
    const res = await fetch(`${API_BASE}/teams`, { headers: getHeaders() });
    const data = await res.json();
    return data.teams || data;
  },

  getLineup: async (roundId: number): Promise<LineupEntry[]> => {
    const res = await fetch(`${API_BASE}/lineup?round_id=${roundId}`, { headers: getHeaders() });
    return res.json();
  },

  getAvailableAthletes: async (roundId: number): Promise<Athlete[]> => {
    const res = await fetch(`${API_BASE}/availability?round_id=${roundId}`, { headers: getHeaders() });
    const data = await res.json();
    return data.rounds ? data.rounds.filter((r:any) => r.status === 'available').map((r:any) => ({
      zwid: r.zwid,
      name: r.athlete_name || 'Rider',
      category: r.category || 'N/A'
    })) : [];
  },

  getResults: async (roundId: number): Promise<RaceResult[]> => {
    const res = await fetch(`${API_BASE}/results?round_id=${roundId}`, { headers: getHeaders() });
    const data = await res.json();
    return data.results || data;
  },

  updateLineup: async (entry: LineupEntry): Promise<any> => {
    const res = await fetch(`${API_BASE}/lineup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(entry),
    });
    return res.json();
  },

  removeFromLineup: async (round_id: number, team_id: number, athlete_id: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/lineup`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ round_id, team_id, athlete_id }),
    });
    return res.json();
  },

  getUserAvailability: async (): Promise<AvailabilityData> => {
    const res = await fetch(`${API_BASE}/availability`, { headers: getHeaders() });
    return res.json();
  },

  updateTimePreferences: async (preferences: { slotId: string, level: number }[]): Promise<any> => {
    const res = await fetch(`${API_BASE}/availability/preferences`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ preferences }),
    });
    return res.json();
  },

  updateRaceAvailability: async (roundId: number, status: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/availability/race`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roundId, status }),
    });
    return res.json();
  },

  // Admin Methods
  listUsers: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/list_users`, { headers: getHeaders() });
    return res.json();
  },

  updateUserRole: async (userId: number, newRole: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/update_role`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, newRole }),
    });
    return res.json();
  },

  // Event Methods
  getEvents: async (): Promise<InoxEvent[]> => {
    const res = await fetch(`${API_BASE}/events`, { headers: getHeaders() });
    return res.json();
  },

  createEvent: async (event: Omit<InoxEvent, 'id'>): Promise<any> => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    return res.json();
  },

  updateEvent: async (event: InoxEvent): Promise<any> => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    return res.json();
  },

  deleteEvent: async (id: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/events?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  }
};
