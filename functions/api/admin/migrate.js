// functions/api/admin/migrate.js
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

        return new Response(JSON.stringify({ 
            message: "Migrazione completata", 
            results: results 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
