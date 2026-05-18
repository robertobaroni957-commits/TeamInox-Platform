import { normalizeSeasonStatus } from './normalize.js';

/**
 * Wrapper globale per le Cloudflare Pages Functions.
 * Intercetta ogni eccezione, logga l'errore con un traceId,
 * e garantisce sempre una risposta HTTP 200 conforme al contratto.
 */
export function withSafeHandler(handler) {
    return async (context) => {
        const traceId = context.data.traceId || crypto.randomUUID();
        try {
            return await handler(context);
        } catch (err) {
            console.error(`[API-ERROR][${traceId}]`, err);
            
            // Ritorna un payload normalizzato con errore
            const errorPayload = normalizeSeasonStatus(null, null, traceId, 'anonymous', err.message || "Internal Server Error");
            
            return new Response(JSON.stringify(errorPayload), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };
}
