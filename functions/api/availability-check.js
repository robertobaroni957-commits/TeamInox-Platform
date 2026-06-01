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
        // 0. Recuperiamo la serie attiva
        const activeSeries = await env.ZRL_DB.prepare(`SELECT id FROM series WHERE is_active = 1 LIMIT 1`).first();
        if (!activeSeries) return jsonResponse({ missing: false });

        // 1. Verifichiamo l'intento per la serie attiva
        const intent = await env.ZRL_DB.prepare(`
            SELECT intent FROM zrl_participation_intent WHERE zwid = ? AND series_id = ?
        `).bind(user.zwid, activeSeries.id).first();

        // Se l'intento manca, è missing
        if (!intent) {
            return jsonResponse({ missing: true, reason: 'intent_missing' });
        }

        // Se l'intento è "non partecipo" (0), non è missing
        if (intent.intent === 0) {
            return jsonResponse({ missing: false });
        }

        // Se l'intento è "partecipo" (1), verifichiamo il resto
        
        // 2. Verifichiamo se ha espresso almeno una preferenza oraria
        const prefs = await env.ZRL_DB.prepare(`
            SELECT COUNT(*) as count FROM user_time_preferences WHERE zwid = ? AND preference_level >= 0
        `).bind(user.zwid).first();

        // Se mancano le preferenze orarie, è missing
        if (!prefs || prefs.count === 0) {
            return jsonResponse({ missing: true, reason: 'prefs_missing' });
        }

        // Se ha espresso l'intento e gli orari, per noi il "sondaggio" è completato.
        // La disponibilità alle singole gare è un extra opzionale se il calendario esiste.
        
        return jsonResponse({
            missing: false,
            details: {
                intent: true,
                prefs: prefs.count
            }
        });
    } catch (err) {
        return jsonResponse(null, 500, false, err.message);
    }
}
