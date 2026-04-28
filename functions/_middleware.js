// ================================
// Middleware globale INOXTEAM API
// JWT + RBAC + Anti-cache
// ================================
import { jwtVerify } from 'jose';

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
        GET: ['admin', 'moderator', 'captain', 'user'],
        POST: ['admin', 'moderator', 'captain'],
        PATCH: ['admin', 'moderator', 'captain'],
        DELETE: ['admin', 'moderator', 'captain']
    }
};

const PUBLIC_ROUTES = [
    '/api/login_auth',
    '/api/register',
    '/api/series',
    '/api/rounds',
    '/api/results',
    '/api/teams',
    '/api/setup-zrl-2026',
    '/api/sync-schedule',
    '/api/sync-rounds',
    '/api/sync-all-teams',
    '/api/setup-admin',
    '/api/availability-check',
    '/api/admin/ingest-wtrl-team'
];

export async function onRequest(context) {
    const { request, env, next, data } = context;
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase().replace(/\/$/, '');
    const method = request.method;

    if (!path.startsWith('/api')) {
        return next();
    }

    // --- GESTIONE CORS PREFLIGHT (Per Ultra-Sync) ---
    if (method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
            }
        });
    }

    if (PUBLIC_ROUTES.includes(path) && method === 'GET') {
        return handleNext(next);
    }

    if (['/api/login_auth', '/api/register', '/api/sync-schedule', '/api/sync-rounds', '/api/sync-all-teams'].includes(path)) {
        return handleNext(next);
    }

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

        if (payload.role === 'athlete') payload.role = 'user';
        data.user = payload;

        if (!checkPermissions(path, method, payload.role)) {
            return jsonError(`Forbidden: ${payload.role} role cannot access this resource`, 403);
        }

        return handleNext(next);

    } catch (err) {
        return jsonError('Unauthorized: Session expired or invalid', 401);
    }
}

function checkPermissions(path, method, userRole) {
    if (userRole === 'admin') return true;
    for (const [route, requirements] of Object.entries(RBAC_POLICY)) {
        if (path.startsWith(route)) {
            const allowedRoles = Array.isArray(requirements) ? requirements : requirements[method];
            if (allowedRoles && allowedRoles.includes(userRole)) return true;
            return false;
        }
    }
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
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

function applyNoCache(response) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Cache-Control', 'no-store');
    return newResponse;
}
