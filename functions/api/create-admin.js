// functions/api/create-admin.js
import bcrypt from 'bcryptjs';

export async function onRequestGet({ env }) {
    if (!env.DB) {
        return new Response(JSON.stringify({ error: "Database non configurato." }), { status: 500 });
    }

    try {
        // 1. CREAZIONE TABELLA 'users'
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                role TEXT DEFAULT 'athlete',
                zwift_power_id INTEGER,
                active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        const email = "admin@teaminox.it";
        const password = "InoxTeam2026!";
        const username = "AdminInox";
        const role = "admin";

        // Hashing della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. INSERIMENTO/AGGIORNAMENTO ADMIN
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();

        if (existing) {
            await env.DB.prepare(
                "UPDATE users SET password_hash = ?, role = ?, username = ? WHERE email = ?"
            ).bind(hashedPassword, role, username, email).run();
        } else {
            await env.DB.prepare(
                "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)"
            ).bind(username, email, hashedPassword, role).run();
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Tabella 'users' verificata e Admin generato/aggiornato!",
            credentials: { email, password, role }
        }), { headers: { "Content-Type": "application/json" } });

    } catch (error) {
        console.error("Create Admin Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
