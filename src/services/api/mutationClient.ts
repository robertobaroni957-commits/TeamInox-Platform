import { apiFetch } from '../api';

export async function executeMutation(type: string, payload: any) {
  const idempotencyKey = crypto.randomUUID();
  
  return apiFetch('/api/mutation/execute', {
    method: 'POST',
    body: JSON.stringify({
      type,
      payload,
      idempotencyKey
    })
  });
}
