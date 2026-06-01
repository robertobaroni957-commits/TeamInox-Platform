// functions/api/admin/_middleware.js
import { jsonResponse } from '../utils';

export async function onRequest(context) {
    const { data, next } = context;
    const user = data?.user;

    // Strict check: only admin, moderator, or captain can access /api/admin/*
    if (!user || (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'captain')) {
        console.warn(`[SECURITY] Unauthorized access attempt to ${context.request.url} by ${user?.role || 'anonymous'}`);
        return new Response(JSON.stringify({ 
            error: "Forbidden: Administrative privileges required",
            reason: "role_insufficient"
        }), { 
            status: 403, 
            headers: { "Content-Type": "application/json" } 
        });
    }

    return next();
}
