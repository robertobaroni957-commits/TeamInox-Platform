// functions/api/admin/update_athlete.js
export async function onRequestPost({ request, env }) {
    // Il middleware ha già verificato il ruolo 'admin'
    if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500 });
    }

    try {
        const { userId, role, category, gender } = await request.json();
        
        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID mancante' }), { status: 400 });
        }

        const updates = [];
        const params = [];

        if (role !== undefined) {
            updates.push("role = ?");
            params.push(role);
        }
        if (category !== undefined) {
            updates.push("base_category = ?");
            params.push(category);
        }
        if (gender !== undefined) {
            updates.push("gender = ?");
            params.push(gender);
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({ error: 'Nessun dato da aggiornare' }), { status: 400 });
        }

        params.push(userId);
        const query = `UPDATE athletes SET ${updates.join(", ")} WHERE zwid = ?`;

        await env.DB.prepare(query).bind(...params).run();

        return new Response(JSON.stringify({ success: true, message: 'Atleta aggiornato con successo' }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin Update Athlete Error:', error);
        return new Response(JSON.stringify({ error: 'Errore durante l\'aggiornamento dell\'atleta' }), { status: 500 });
    }
}
