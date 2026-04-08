// functions/api/test.js
export async function onRequestGet({ env }) {
    try {
        const queries = [
            "ALTER TABLE rounds ADD COLUMN format TEXT DEFAULT 'Scratch'",
            "ALTER TABLE rounds ADD COLUMN distance REAL DEFAULT 0",
            "ALTER TABLE rounds ADD COLUMN elevation REAL DEFAULT 0",
            "ALTER TABLE rounds ADD COLUMN powerups TEXT",
            "ALTER TABLE rounds ADD COLUMN strategy_details TEXT"
        ];

        const results = [];
        for (const query of queries) {
            try {
                await env.DB.prepare(query).run();
                results.push({ query, success: true });
            } catch (err) {
                // Se la colonna esiste già, lo ignoriamo
                results.push({ query, success: false, error: err.message });
            }
        }

        // Recuperiamo anche i team per conferma
        const teams = await env.DB.prepare("SELECT COUNT(*) as count FROM teams").first();

        return new Response(JSON.stringify({ 
            message: "Migrazione DATABASE via /api/test completata", 
            results: results,
            teams_in_db: teams ? teams.count : 0
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
