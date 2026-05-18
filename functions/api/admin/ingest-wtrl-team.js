import { ZRLService } from '../../../src/services/zrlService';

export async function onRequestPost({ request, env }) {
  const payload = await request.json();
  const service = new zrlService(env.ZRL_DB);
  try {
    if (!payload.meta || !payload.meta.team) {
      return new Response(JSON.stringify({ error: "Struttura JSON non valida." }), { status: 400 });
    }
    const result = await service.ingestWtrlTeam(payload);
    return new Response(JSON.stringify({ success: true, team: payload.meta.team.name, riders_synced: payload.riders?.length || 0 }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

