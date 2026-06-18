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
      // Dispatch custom event for 401
      window.dispatchEvent(new CustomEvent('api-unauthorized'));
    }
    
    let errorMessage = `Errore Server: ${res.status}`;
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch (e) {
      // Ignora errori nel parsing dell'errore
    }
    throw new Error(errorMessage);
  }
  
  // Rimuoviamo il controllo rigido sul Content-Type se la risposta è OK
  // Il server potrebbe non inviare sempre l'header corretto
  return res.json();
};

let currentTraceId: string | null = null;

export const apiFetch = async <T = any>(
  url: string, 
  options: RequestInit = {}, 
  retries = 2,
  backoff = 1000
): Promise<T> => {
  const token = localStorage.getItem('inox_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(currentTraceId ? { 'x-debug-trace-id': currentTraceId } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const traceId = response.headers.get('x-debug-trace-id');
    if (traceId) currentTraceId = traceId;

    // Standard handleResponse handles 4xx/5xx by throwing Error
    return await handleResponse(response);
  } catch (error: any) {
    // ONLY RETRY if:
    // 1. It's a network error (no response)
    // 2. It's a 5xx Server Error (transient)
    // DO NOT retry on 4xx (Client Errors like 400 Bad Request, 401, 403, 404)
    
    const isNetworkError = !error.status; // fetch throw doesn't usually have status
    const isServerError = error.status >= 500;
    const isAuthError = error.status === 401 || error.status === 403;

    if (retries > 0 && (isNetworkError || isServerError) && !isAuthError) {
      console.warn(`Fetch failed for ${url}, retrying in ${backoff}ms... (${retries} left)`, error);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return apiFetch(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export const getCurrentTraceId = () => currentTraceId;

export const api = {
  getSeries: async (): Promise<Series[]> => {
    const data = await apiFetch(`${API_BASE}/series`);
    return data.series || data;
  },

  getRounds: async (seriesId?: number): Promise<Round[]> => {
    const url = seriesId ? `${API_BASE}/rounds?series_id=${seriesId}` : `${API_BASE}/rounds`;
    const data = await apiFetch(url);
    return data.rounds || data;
  },

  getTeams: async (): Promise<Team[]> => {
    const data = await apiFetch(`${API_BASE}/teams`);
    return data.teams || data;
  },

  getLineup: async (roundId: number): Promise<LineupEntry[]> => {
    return apiFetch(`${API_BASE}/lineup?round_id=${roundId}`);
  },

  getAvailableAthletes: async (roundId: number): Promise<Athlete[]> => {
    const data = await apiFetch(`${API_BASE}/availability?round_id=${roundId}`);
    return data.rounds ? data.rounds.filter((r:any) => r.status === 'available').map((r:any) => ({
      zwid: r.zwid,
      name: r.athlete_name || 'Rider',
      category: r.category || 'N/A'
    })) : [];
  },

  getResults: async (roundId: number): Promise<RaceResult[]> => {
    const data = await apiFetch(`${API_BASE}/results?round_id=${roundId}`);
    return data.results || data;
  },

  updateLineup: async (entry: LineupEntry): Promise<any> => {
    return apiFetch(`${API_BASE}/lineup`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  removeFromLineup: async (round_id: number, race_id: number, team_id: number, athlete_id: number): Promise<any> => {
    return apiFetch(`${API_BASE}/lineup`, {
      method: 'DELETE',
      body: JSON.stringify({ round_id, race_id, team_id, athlete_id }),
    });
  },

  getUserAvailability: async (): Promise<AvailabilityData> => {
    return apiFetch(`${API_BASE}/availability`);
  },

  getAllAvailabilities: async (): Promise<any> => {
    return apiFetch(`${API_BASE}/availability?all=true`);
  },

  updateTimePreferences: async (preferences: { slotId: string, level: number }[]): Promise<any> => {
    return apiFetch(`${API_BASE}/availability`, {
      method: 'POST',
      body: JSON.stringify({ type: 'preferences', payload: preferences }),
    });
  },

  updateIntent: async (intent: boolean): Promise<any> => {
    return apiFetch(`${API_BASE}/availability`, {
      method: 'POST',
      body: JSON.stringify({ type: 'intent', payload: { intent } }),
    });
  },

  updateRaceAvailability: async (raceId: number, status: string): Promise<any> => {
    return apiFetch(`${API_BASE}/availability`, {
      method: 'POST',
      body: JSON.stringify({ 
        type: 'race', 
        payload: { 
            raceId: Number(raceId),
            status: String(status)
        } 
      }),
    });
  },

  listUsers: async (): Promise<any[]> => {
    return apiFetch(`${API_BASE}/admin/list_users`);
  },

  updateUserRole: async (userId: number, role: string): Promise<any> => {
    return apiFetch(`${API_BASE}/admin/update_role`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  },

  updateAthlete: async (userId: number, data: { role?: string, category?: string, gender?: string }): Promise<any> => {
    return apiFetch(`${API_BASE}/admin/update_athlete`, {
      method: 'POST',
      body: JSON.stringify({ userId, ...data }),
    });
  },

  deleteUser: async (userId: number): Promise<any> => {
    return apiFetch(`${API_BASE}/admin/delete_user`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  getEvents: async (): Promise<InoxEvent[]> => {
    return apiFetch(`${API_BASE}/events`);
  },

  checkZRLParticipation: async (): Promise<boolean> => {
    const data = await apiFetch(`${API_BASE}/check-zrl-participation`);
    return data.isZRLParticipant || false;
  },

  getRoster: async (teamId: number = 0, roundId?: number): Promise<Athlete[]> => {
    const url = roundId 
      ? `${API_BASE}/roster?team_id=${teamId}&round_id=${roundId}`
      : `${API_BASE}/roster?team_id=${teamId}`;
    const data = await apiFetch(url);
    return data.roster || [];
  },

  assignToRoster: async (athleteZwid: number, teamId: number): Promise<any> => {
    return apiFetch(`${API_BASE}/roster`, {
      method: 'POST',
      body: JSON.stringify({ athlete_zwid: athleteZwid, team_id: teamId }),
    });
  },

  createEvent: async (event: Omit<InoxEvent, 'id'>): Promise<any> => {
    return apiFetch(`${API_BASE}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  updateEvent: async (event: InoxEvent): Promise<any> => {
    return apiFetch(`${API_BASE}/events`, {
      method: 'PATCH',
      body: JSON.stringify(event),
    });
  },

  deleteEvent: async (id: number): Promise<any> => {
    return apiFetch(`${API_BASE}/events?id=${id}`, {
      method: 'DELETE',
    });
  },

  getRosterSuggestions: async (): Promise<any> => {
    return apiFetch(`${API_BASE}/admin/roster-suggestions`);
  },

  checkAvailabilityStatus: async (): Promise<{ missing: boolean }> => {
    return apiFetch(`${API_BASE}/availability-check`);
  },

  getDivisionFilters: async (): Promise<{ rounds: any[], leagues: any[] }> => {
    return apiFetch(`${API_BASE}/division-results`);
  },

  getDivisionResults: async (roundId: number, leagueKey: string, mode: string = 'gc'): Promise<any> => {
    return apiFetch(`${API_BASE}/division-results?round_id=${roundId}&league_key=${leagueKey}&mode=${mode}`);
  }
};
