// Cloudflare Function for user registration

import { SignJWT } from 'jose'; // Import from 'jose' library, though not directly used for registration itself, useful for context if needed later.

// Hash function compatible with Web Crypto API (for Workers)
async function hashPassword(password) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashedPassword;
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB; // Assumes D1 binding is named DB in wrangler.toml

    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return new Response(JSON.stringify({ error: 'Username, email, and password are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if username or email already exists
        const existingUser = await db.prepare("SELECT id FROM users WHERE username = ? OR email = ?")
                                     .bind(username, email)
                                     .first();

        if (existingUser) {
            return new Response(JSON.stringify({ error: 'Username or email already in use.' }), {
                status: 409, // Conflict
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const hashedPassword = await hashPassword(password);

        // Insert new user into D1
        const { success } = await db.prepare(
            "INSERT INTO users (username, email, password_hash, role, is_admin) VALUES (?, ?, ?, ?, ?)"
        ).bind(username, email, hashedPassword, 'user', 0) // Default role 'user', not admin
         .run();

        if (success) {
            return new Response(JSON.stringify({ message: 'User registered successfully!' }), {
                status: 201, // Created
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error('Failed to insert user into database.');
        }

    } catch (error) {
        console.error("Error during registration:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
