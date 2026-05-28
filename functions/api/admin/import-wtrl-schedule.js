import { jsonResponse } from '../utils';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { html, season_code } = await request.json();

    if (!html) return jsonResponse({ error: "Content is missing" }, 400, false, "Content is missing");
    if (!season_code) return jsonResponse({ error: "season_code is missing" }, 400, false, "season_code is missing");

    const db = env.ZRL_DB;

    try {
        // Logica di parsing WTRL originale...
        // ...

        // Operazioni Round-Centric
        // Non toccare tabelle di orchestrator o lifecycle di stagione.

        return jsonResponse({ success: true, message: "Importazione completata." });
    } catch (err) {
        return jsonResponse(null, 500, false, err.message);
    }
}

