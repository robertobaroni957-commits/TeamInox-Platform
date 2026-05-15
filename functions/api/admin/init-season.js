
import { zrlService } from '../../../src/services/zrlService';

export async function onRequestPost({ request, env }) {
  const payload = await request.json();
  const service = new zrlService(env.DB);
  try {
    const result = await service.initSeason(payload);
    return new Response(JSON.stringify({ success: true, result }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
