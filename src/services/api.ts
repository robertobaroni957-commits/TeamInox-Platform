import type { 
  Round, 
  Team, 
  Athlete, 
  AvailabilityData, 
  LineupEntry, 
  RaceResult, 
  Series,
  InoxEvent
} from './types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('inox_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('inox_token');
      // Non facciamo redirect forzato qui per evitare loop nel mezzo di un render
    }
    const errorData = (contentType && contentType.includes("application/json")) 
      ? await res.json() 
      : { message: `Errore Server: ${res.status}` };
    throw new Error(errorData.message || errorData.error || 'Errore sconosciuto');
  }
  
  if (!contentType || !contentType.includes("application/json")) {
    console.error("Ricevuta risposta non-JSON:", await res.text());
    throw new Error("Il server ha risposto con un formato non valido (HTML). Controlla le API.");
  }
  
  return res.json();
};

export const api = {
  getSeries: async (): Promise<Series[]> => {
    const res = await fetch(`${API_BASE}/series`, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.series || data;
  },

  getRounds: async (seriesId?: number): Promise<Round[]> => {
    const url = seriesId ? `${API_BASE}/rounds?series_id=${seriesId}` : `${API_BASE}/rounds`;
    const res = await fetch(url, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.rounds || data;
  },

  getTeams: async (): Promise<Team[]> => {
    const res = await fetch(`${API_BASE}/teams`, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.teams || data;
  },

  getLineup: async (roundId: number): Promise<LineupEntry[]> => {
    const res = await fetch(`${API_BASE}/lineup?round_id=${roundId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getAvailableAthletes: async (roundId: number): Promise<Athlete[]> => {
    const res = await fetch(`${API_BASE}/availability?round_id=${roundId}`, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.rounds ? data.rounds.filter((r:any) => r.status === 'available').map((r:any) => ({
      zwid: r.zwid,
      name: r.athlete_name || 'Rider',
      category: r.category || 'N/A'
    })) : [];
  },

  getResults: async (roundId: number): Promise<RaceResult[]> => {
    const res = await fetch(`${API_BASE}/results?round_id=${roundId}`, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.results || data;
  },

  updateLineup: async (entry: LineupEntry): Promise<any> => {
    const res = await fetch(`${API_BASE}/lineup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(entry),
    });
    return handleResponse(res);
  },

  removeFromLineup: async (round_id: number, team_id: number, athlete_id: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/lineup`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ round_id, team_id, athlete_id }),
    });
    return handleResponse(res);
  },

  getUserAvailability: async (): Promise<AvailabilityData> => {
    const res = await fetch(`${API_BASE}/availability`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getAllAvailabilities: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/availability?all=true`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updateTimePreferences: async (preferences: { slotId: string, level: number }[]): Promise<any> => {
    const res = await fetch(`${API_BASE}/availability`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type: 'preferences', payload: preferences }),
    });
    return handleResponse(res);
  },

  updateRaceAvailability: async (roundId: number, status: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/availability`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type: 'race', payload: { roundId, status } }),
    });
    return handleResponse(res);
  },

  listUsers: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/list_users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updateUserRole: async (userId: number, role: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/update_role`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, role }),
    });
    return handleResponse(res);
  },

  deleteUser: async (userId: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/delete_user`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  getEvents: async (): Promise<InoxEvent[]> => {
    const res = await fetch(`${API_BASE}/events`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getRoster: async (teamId: number, roundId?: number): Promise<Athlete[]> => {
    const url = roundId 
      ? `${API_BASE}/roster?team_id=${teamId}&round_id=${roundId}`
      : `${API_BASE}/roster?team_id=${teamId}`;
    const res = await fetch(url, { headers: getHeaders() });
    const data = await handleResponse(res);
    return data.roster || [];
  },

  assignToRoster: async (athleteZwid: number, teamId: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/roster`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ athlete_zwid: athleteZwid, team_id: teamId }),
    });
    return handleResponse(res);
  },

  createEvent: async (event: Omit<InoxEvent, 'id'>): Promise<any> => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    return handleResponse(res);
  },

  updateEvent: async (event: InoxEvent): Promise<any> => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    return handleResponse(res);
  },

  deleteEvent: async (id: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/events?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getRosterSuggestions: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/roster-suggestions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  checkAvailabilityStatus: async (): Promise<{ missing: boolean }> => {
    const res = await fetch(`${API_BASE}/availability-check`, { headers: getHeaders() });
    return handleResponse(res);
  }
};
