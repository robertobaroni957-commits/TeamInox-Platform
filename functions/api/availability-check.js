import { createLegacyAdapter } from './admin/season/createLegacyAdapter';

export const onRequestGet = createLegacyAdapter(async (context) => {
    const { env, data } = context;
    const user = data?.user;
    const seasonId = data?.seasonId;

    // Se anonimo o guest, restituiamo un oggetto di default senza errori
    if (!user || user.role === 'guest' || user.role === 'anonymous') {
        return { missing: false };
    }

    if (!env.ZRL_DB) throw new Error("Database non disponibile");

    // 1. Verifichiamo se ha espresso almeno una preferenza oraria
    const prefs = await env.ZRL_DB.prepare(`
      SELECT COUNT(*) as count FROM user_time_preferences WHERE zwid = ? AND preference_level >= 1
    `).bind(user.zwid).first();

    // 2. Verifichiamo se ha risposto ad almeno un round della serie attiva (Scoped by seasonId)
    const rsvp = await env.ZRL_DB.prepare(`
      SELECT COUNT(*) as count FROM availability 
      WHERE athlete_id = ? 
      AND round_id IN (SELECT id FROM rounds WHERE series_id = ?)
    `).bind(user.zwid, seasonId).first();

    const isMissing = (prefs?.count === 0 || rsvp?.count === 0);

    return { 
      missing: isMissing,
      details: {
        prefs: prefs?.count || 0,
        rsvp: rsvp?.count || 0
      }
    };
});

