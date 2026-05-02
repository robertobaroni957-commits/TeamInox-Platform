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

        // 1. Controllo se lo ZWID esiste già
        const existingAthlete = await env.DB.prepare("SELECT zwid, password_hash FROM athletes WHERE zwid = ?").bind(zwid).first();
        
        if (existingAthlete) {
            if (existingAthlete.password_hash) {
                return new Response(JSON.stringify({ message: 'Questo Zwift ID è già registrato.' }), { 
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // L'atleta esiste (importato) ma non ha password. Procediamo all'aggiornamento.
            // Prima verifichiamo che l'email non sia usata da ALTRI
            const emailTaken = await env.DB.prepare("SELECT zwid FROM athletes WHERE email = ? AND zwid != ?").bind(email, zwid).first();
            if (emailTaken) {
                return new Response(JSON.stringify({ message: 'Email già in uso da un altro profilo.' }), { 
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await env.DB.prepare(
                "UPDATE athletes SET name = ?, email = ?, password_hash = ? WHERE zwid = ?"
            ).bind(username, email, hashedPassword, zwid).run();

            return new Response(JSON.stringify({ 
                message: 'Profilo completato! Ora puoi effettuare il login.',
                zwid: zwid
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // 2. Lo ZWID non esiste, creiamo un nuovo atleta. 
        // Verifichiamo prima l'email
        const emailTaken = await env.DB.prepare("SELECT zwid FROM athletes WHERE email = ?").bind(email).first();
        if (emailTaken) {
            return new Response(JSON.stringify({ message: 'Email già registrata.' }), { 
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
