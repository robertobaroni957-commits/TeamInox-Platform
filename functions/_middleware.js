// ================================
// Middleware globale INOXTEAM API
// JWT + Anti-cache + Logging
// ================================
import { jwtVerify } from 'jose';

export async function onRequest(context) {
    const { request, env, next, data } = context;
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase().replace(/\/$/, '');

    // Log richieste API
    console.log(`[Middleware] ${request.method} ${path}`);

    // ============================
    // 1. Se non inizia con /api, passa al frontend
    // ============================
    if (!path.startsWith('/api')) {
        return next();
    }

    // ============================
    // 2. API pubbliche (SOLO le strettamente necessarie)
    // ============================
    const publicApiRoutes = [
        '/api/login_auth',
        '/api/register',
        '/api/create-admin',
        '/api/test',
        '/api/series',
        '/api/rounds',
        '/api/results',
        '/api/events',
        '/api/teams'
    ];

    if (publicApiRoutes.includes(path)) {
        console.log(`[Middleware] Accesso pubblico consentito per ${path}`);
        try {
            const response = await next();
            if (response.status === 404) {
                return jsonError(`API endpoint not found: ${path}`, 404);
            }
            return applyNoCache(response);
        } catch (e) {
            return jsonError(`Server Error: ${e.message}`, 500);
        }
    }

    // ============================
    // 3. API protette → JWT richiesto
    // ============================
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return jsonError('Missing or invalid authentication token', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        data.user = payload;
        console.log(`[Middleware] JWT valido → ${payload.username} (${payload.role})`);

        const response = await next();
        return applyNoCache(response);

    } catch (err) {
        console.error('[Middleware] JWT Error:', err.message);
        return jsonError('Unauthorized: Session expired or invalid', 401);
    }
}

// ================================
// Funzione helper: risposta JSON errore
// ================================
function jsonError(message, status = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
        }
    });
}

// ================================
// Funzione helper: applica anti-cache
// ================================
function applyNoCache(response) {
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    headers.set('Pragma', 'no-cache');

    return new Response(response.body, {
        status: response.status,
        headers
    });
}
