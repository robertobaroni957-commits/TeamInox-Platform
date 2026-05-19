export const onRequestGet = async (context) => {
    const { env } = context;
    const db = env.ZRL_DB;
    const traceId = context.data?.traceId || crypto.randomUUID();

    try {
        const activeSeason = await db.prepare("SELECT id, name, is_active FROM zrl_seasons WHERE is_active = 1 LIMIT 1").first();

        if (!activeSeason) {
            return new Response(JSON.stringify({
                success: false,
                error: "SEASON_NOT_INITIALIZED",
                traceId
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`[current-season] resolved seasonId: ${activeSeason.id}`);

        return new Response(JSON.stringify({
            success: true,
            data: {
                seasonId: activeSeason.id,
                name: activeSeason.name,
                is_active: activeSeason.is_active
            },
            traceId
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, traceId }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
