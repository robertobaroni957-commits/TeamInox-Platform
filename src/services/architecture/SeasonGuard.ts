export function assertSeasonInitialized(context) {
    const { seasonId } = context.data || {};
    
    // SEASON_BOOTSTRAP is the only endpoint allowed to have a null seasonId
    const isBootstrap = context.request.url.includes('/api/admin/season/bootstrap');
    
    if (!seasonId && !isBootstrap) {
        throw new Error("SEASON_NOT_INITIALIZED");
    }
    
    console.log("[ARCHITECTURE GUARD] PASS: Season Context Valid");
}
