// functions/api/mutation/_middleware.js

export async function onRequest(context) {
    const { data, next } = context;
    const user = data?.user;

    // Strict check: only admin and moderator can access /api/mutation/*
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
        console.warn(`[SECURITY] Unauthorized mutation attempt by ${user?.role || 'anonymous'}`);
        return new Response(JSON.stringify({ 
            error: "Forbidden: Mutation privileges required",
            reason: "role_insufficient"
        }), { 
            status: 403, 
            headers: { "Content-Type": "application/json" } 
        });
    }

    return next();
}
