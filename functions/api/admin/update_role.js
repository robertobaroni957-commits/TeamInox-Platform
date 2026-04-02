// functions/api/admin/update_role.js
import * as jose from 'jose';

export async function onRequestPost({ request, env }) {
    if (!env.DB || !env.JWT_SECRET) {
        return new Response(JSON.stringify({ message: 'Server configuration error.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 1. Verifica Token e Ruolo Admin
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: 'Non autorizzato.' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return new Response(JSON.stringify({ message: 'Permessi insufficienti.' }), { status: 403 });
        }

        // 2. Ricevi dati aggiornamento
        const { userId, newRole } = await request.json();
        
        const validRoles = ['admin', 'captain', 'athlete', 'moderator'];
        if (!validRoles.includes(newRole)) {
            return new Response(JSON.stringify({ message: 'Ruolo non valido.' }), { status: 400 });
        }

        // 3. Aggiorna DB
        await env.DB.prepare(
            "UPDATE athletes SET role = ? WHERE zwid = ?"
        ).bind(newRole, userId).run();

        return new Response(JSON.stringify({ message: 'Ruolo aggiornato con successo.' }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin Update Role Error:', error);
        return new Response(JSON.stringify({ message: 'Errore durante l\'aggiornamento ruolo.' }), { status: 500 });
    }
}
