export async function getActiveSeason(db) {
    const activeSeason = await db.prepare("SELECT id, name FROM zrl_seasons WHERE is_active = 1 LIMIT 1").first();
    return activeSeason;
}

export async function requireActiveSeason(db) {
    const season = await getActiveSeason(db);
    if (!season) {
        throw new Error("Nessuna stagione attiva configurata. Inizializzare una stagione prima di procedere.");
    }
    return season;
}

export async function getSeasonIdFromRequest(request, db) {
    // Priority: Body, Query, then Active Season fallback
    let seasonId;
    
    try {
        const body = await request.clone().json();
        seasonId = body.seasonId;
    } catch (e) {}

    if (!seasonId) {
        const url = new URL(request.url);
        seasonId = url.searchParams.get("seasonId");
    }

    if (!seasonId) {
        const active = await getActiveSeason(db);
        seasonId = active?.id;
    }

    if (!seasonId) throw new Error("Season context non trovato");
    return parseInt(seasonId);
}
