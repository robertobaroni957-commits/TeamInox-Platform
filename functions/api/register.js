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
        const existing = await env.DB.prepare("SELECT zwid FROM athletes WHERE email = ? OR zwid = ?").bind(email, zwid).first();
        if (existing) {
            return new Response(JSON.stringify({ message: 'Email o Zwift ID già registrati.' }), { 
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Hashing
        const hashedPassword = await bcrypt.hash(password, 10); 

        // 3. Inserimento in ATHLETES
        await env.DB.prepare(
            "INSERT INTO athletes (zwid, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
        ).bind(zwid, username, email, hashedPassword, 'athlete').run();

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
