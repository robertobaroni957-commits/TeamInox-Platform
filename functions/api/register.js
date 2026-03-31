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
        const { username, email, password, zwid } = await request.json();

        if (!username || !email || !password || !zwid || password.length < 8) {
            return new Response(JSON.stringify({ message: 'Dati mancanti (Username, Email, Password, Zwift ID) o password troppo corta.' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Controllo duplicati (Email o ZWID)
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? OR zwift_power_id = ?").bind(email, zwid).first();
        if (existing) {
            return new Response(JSON.stringify({ message: 'Email o Zwift ID già registrati.' }), { 
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Hashing
        const hashedPassword = await bcrypt.hash(password, 10); 

        // 3. Inserimento in USERS e ATHLETES (Transazione via batch)
        await env.DB.batch([
            env.DB.prepare("INSERT INTO users (username, email, password_hash, role, zwift_power_id) VALUES (?, ?, ?, ?, ?)").bind(username, email, hashedPassword, 'athlete', zwid),
            env.DB.prepare("INSERT INTO athletes (zwid, name, email, role) VALUES (?, ?, ?, ?)").bind(zwid, username, email, 'athlete')
        ]);

        return new Response(JSON.stringify({ 
            message: 'Registrazione completata! Ora puoi effettuare il login.',
            zwid: zwid
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
