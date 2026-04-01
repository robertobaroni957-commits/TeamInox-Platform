// functions/api/create-admin.js
import bcrypt from 'bcryptjs';

export async function onRequestGet({ env }) {
    if (!env.DB) {
        return new Response(JSON.stringify({ error: "Database non configurato." }), { status: 500 });
    }

    try {
        const email = "admin@teaminox.it";
        const password = "InoxTeam2026!";
        const username = "AdminInox";
        const role = "admin";
        const zwid = 1; // ZwiftID fisso per l'Admin di sistema

        // Hashing della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // INSERIMENTO/AGGIORNAMENTO NELLA TABELLA ATHLETES (quella usata dal sistema unified)
        const existing = await env.DB.prepare("SELECT zwid FROM athletes WHERE zwid = ?").bind(zwid).first();

        if (existing) {
            await env.DB.prepare(
                "UPDATE athletes SET name = ?, email = ?, password_hash = ?, role = ? WHERE zwid = ?"
            ).bind(username, email, hashedPassword, role, zwid).run();
        } else {
            await env.DB.prepare(
                "INSERT INTO athletes (zwid, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
            ).bind(zwid, username, email, hashedPassword, role).run();
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Admin generato/aggiornato nella tabella athletes!",
            credentials: { zwid, email, password, role }
        }), { headers: { "Content-Type": "application/json" } });

    } catch (error) {
        console.error("Create Admin Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
