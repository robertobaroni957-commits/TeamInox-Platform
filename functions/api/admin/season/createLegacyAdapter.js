/**
 * Adattatore per endpoints legacy.
 * Normalizza la risposta mantenendo intatta la logica di business.
 */
export function createLegacyAdapter(handler) {
  return async (context) => {
    const { request, data } = context;
    const traceId = data.traceId || crypto.randomUUID();

    try {
      // Esegue l'handler legacy esistente
      const response = await handler(context);

      // Se è già una Response, proviamo a estrarne il contenuto
      if (response instanceof Response) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const body = await response.json();
          // Verifica se è già nel formato standard
          if (body && typeof body === 'object' && 'success' in body) {
            return new Response(JSON.stringify({ ...body, traceId }), {
              status: response.status,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          // Normalizza formato legacy
          return new Response(JSON.stringify({
            success: response.ok,
            data: body,
            error: body.error || null,
            traceId
          }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return response; // Pass-through per non-JSON (es. file)
      }

      // Se l'handler ritorna un oggetto JS diretto
      return new Response(JSON.stringify({
        success: true,
        data: response,
        error: null,
        traceId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      console.error(`[LegacyAdapter Error] ${traceId}:`, err);
      return new Response(JSON.stringify({
        success: false,
        error: err.message || 'Internal Server Error',
        traceId
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}
