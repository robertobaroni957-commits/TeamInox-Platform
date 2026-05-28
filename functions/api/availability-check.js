import { jsonResponse } from './utils';

export async function onRequestGet(context) {
    const { env, request, data } = context;
    const user = data?.user;

    // Se anonimo o guest, restituiamo un oggetto di default senza errori
    if (!user || user.role === 'guest' || user.role === 'anonymous') {
        return jsonResponse({ missing: false });
    }

    if (!env.ZRL_DB) return jsonResponse({ error: "Database non disponibile" }, 500, false, "Database non disponibile");

    try {
        // 1. Verifichiamo se ha espresso almeno una preferenza oraria
        const prefs = await env.ZRL_DB.prepare(`
        SELECT COUNT(*) as count FROM user_time_preferences WHERE zwid = ? AND preference_level >= 1
        `).bind(user.zwid).first();

        // 2. Verifichiamo se ha risposto ad almeno un round (senza vincoli di serie/stagione)
        const rsvp = await env.ZRL_DB.prepare(`
        SELECT COUNT(*) as count FROM availability
        WHERE zwid = ?
        `).bind(user.zwid).first();

        const isMissing = (prefs?.count === 0 || rsvp?.count === 0);

        return jsonResponse({
            missing: isMissing,
            details: {
                prefs: prefs?.count || 0,
                rsvp: rsvp?.count || 0
            }
        });
    } catch (err) {
        return jsonResponse(null, 500, false, err.message);
    }
}
