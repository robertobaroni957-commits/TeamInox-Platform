export type SyncResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const API = import.meta.env.VITE_API_URL || '';

export const syncAllTeams = async (signal?: AbortSignal): Promise<SyncResponse> => {
  const response = await fetch(`${API}/api/sync-all-teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal
  });

  const text = await response.text();

  let data: SyncResponse;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Risposta non JSON dal server');
  }

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data;
};
