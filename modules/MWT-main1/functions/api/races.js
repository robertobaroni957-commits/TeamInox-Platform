// Cloudflare Function to list available race IDs


export async function onRequestGet(context) {
    const { env } = context;
    const db = env.ZRL_DB; // Assumes D1 binding is named DB in wrangler.toml

    try {
        const { results } = await db.prepare("SELECT DISTINCT race_id FROM race_data ORDER BY race_id ASC").all();
        const raceIds = results.map(row => row.race_id);
        return new Response(JSON.stringify(raceIds), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error fetching race IDs:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
