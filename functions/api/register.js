// functions/api/register.js
import bcrypt from 'bcryptjs'; 

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.DB) {
        return new Response(JSON.stringify({ message: 'Database non configurato.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password || password.length < 8) {
            return new Response(JSON.stringify({ message: 'Dati mancanti o password troppo corta (min 8 car).' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Controllo duplicati
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) {
            return new Response(JSON.stringify({ message: 'Email già in uso.' }), { 
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Hashing
        const hashedPassword = await bcrypt.hash(password, 10); 

        // 3. Inserimento
        const result = await env.DB.prepare(
            "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)"
        ).bind(username, email, hashedPassword, 'athlete').run();

        return new Response(JSON.stringify({ 
            message: 'Registrazione completata! Ora puoi effettuare il login.',
            userId: result.meta.lastRowId
        }), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Errore registrazione:', error);
        return new Response(JSON.stringify({ message: 'Errore interno: ' + error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
