// functions/api/admin/update_role.js
export async function onRequestPost({ request, env }) {
    // Il middleware ha già verificato il ruolo 'admin'
    if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500 });
    }

    try {
        const { userId, newRole } = await request.json();
        
        // Definiamo i ruoli ufficiali. 'athlete' è accettato per compatibilità legacy ma convertito internamente.
        const validRoles = ['admin', 'moderator', 'captain', 'user', 'athlete'];
        if (!validRoles.includes(newRole)) {
            return new Response(JSON.stringify({ error: 'Ruolo non valido' }), { status: 400 });
        }

        // 3. Aggiorna DB
        await env.DB.prepare(
            "UPDATE athletes SET role = ? WHERE zwid = ?"
        ).bind(newRole, userId).run();

        return new Response(JSON.stringify({ success: true, message: 'Ruolo aggiornato con successo' }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin Update Role Error:', error);
        return new Response(JSON.stringify({ error: 'Errore durante l\'aggiornamento ruolo' }), { status: 500 });
    }
}
