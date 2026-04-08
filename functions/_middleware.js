// ================================
// Middleware globale INOXTEAM API
// JWT + RBAC + Anti-cache
// ================================
import { jwtVerify } from 'jose';

// Matrice dei permessi: Percorso -> Ruoli ammessi
// Se il valore è un array, si applica a tutti i metodi.
// Se è un oggetto, si applica ai singoli metodi.
const RBAC_POLICY = {
    '/api/admin': ['admin'],
    '/api/create-admin': ['admin'],
    '/api/events': {
        GET: ['admin', 'moderator', 'captain', 'user'],
        POST: ['admin', 'moderator'],
        PATCH: ['admin', 'moderator'],
        DELETE: ['admin', 'moderator']
    },
    '/api/availability': {
        GET: ['admin', 'moderator', 'captain', 'user'],
        POST: ['admin', 'moderator', 'captain', 'user']
    },
    '/api/lineup': {
        POST: ['admin', 'captain'],
        PATCH: ['admin', 'captain']
    }
};

const PUBLIC_ROUTES = [
    '/api/login_auth',
    '/api/register',
    '/api/test',
    '/api/series',
    '/api/rounds',
    '/api/results',
    '/api/teams',
    '/api/setup-zrl-2026',
    '/api/sync-schedule',
    '/api/sync-all-teams',
    '/api/setup-admin',
    '/api/admin/migrate'
];

export async function onRequest(context) {
    const { request, env, next, data } = context;
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase().replace(/\/$/, '');
    const method = request.method;

    // EMERGENZA: Bypass totale per la migrazione database
    if (path === '/api/admin/migrate' || path === '/api/migrate') {
        return next();
    }

    // 1. Pass-through per asset statici (non /api)
    if (!path.startsWith('/api')) {
        return next();
    }

    // 2. Controllo Route Pubbliche (Sola Lettura per alcune)
    // Se è in PUBLIC_ROUTES ed è un GET, passa sempre. 
    // Se è un metodo di scrittura, deve passare dal controllo JWT sotto.
    if (PUBLIC_ROUTES.includes(path) && method === 'GET') {
        return handleNext(next);
    }

    // Special case: login, register e sync sono sempre pubblici
    if (['/api/login_auth', '/api/register', '/api/test', '/api/sync-schedule', '/api/sync-all-teams'].includes(path)) {
        return handleNext(next);
    }

    // 3. Verifica JWT per tutte le altre rotte
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return jsonError('Authentication required', 401);
    }

    try {
        const token = authHeader.split(' ')[1];
        if (!env.JWT_SECRET || env.JWT_SECRET.length === 0) {
            throw new Error("JWT_SECRET mancante nella configurazione server.");
        }
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        // Uniformiamo il ruolo 'athlete' in 'user' se necessario
        if (payload.role === 'athlete') payload.role = 'user';
        
        data.user = payload;

        // 4. Controllo RBAC
        if (!checkPermissions(path, method, payload.role)) {
            console.warn(`[RBAC] Access Denied: ${payload.username} (${payload.role}) -> ${method} ${path}`);
            return jsonError(`Forbidden: ${payload.role} role cannot access this resource`, 403);
        }

        return handleNext(next);

    } catch (err) {
        console.error('[Middleware] JWT/RBAC Error:', err.message);
        return jsonError('Unauthorized: Session expired or invalid', 401);
    }
}

function checkPermissions(path, method, userRole) {
    // Admin scavalca tutto
    if (userRole === 'admin') return true;

    // Cerca una regola corrispondente (anche parziale per sottocartelle admin)
    for (const [route, requirements] of Object.entries(RBAC_POLICY)) {
        if (path.startsWith(route)) {
            const allowedRoles = Array.isArray(requirements) 
                ? requirements 
                : requirements[method];
            
            if (allowedRoles && allowedRoles.includes(userRole)) return true;
            return false; // Trovata regola ma ruolo non ammesso
        }
    }

    // Se non c'è una regola specifica in RBAC_POLICY, permetti solo se loggato (default safe)
    return true;
}

async function handleNext(next) {
    try {
        const response = await next();
        return applyNoCache(response);
    } catch (e) {
        return jsonError(`Server Error: ${e.message}`, 500);
    }
}

function jsonError(message, status = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

function applyNoCache(response) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Cache-Control', 'no-store');
    return newResponse;
}
