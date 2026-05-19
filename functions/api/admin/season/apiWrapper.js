export function createSeasonHandler(schema, handler) {
  return async (context) => {
    const { request, data, env } = context;
    const traceId = data.traceId || crypto.randomUUID();

    try {
      let payload = {};
      if (request.method !== 'GET') {
        const body = await request.json();
        payload = schema ? schema.parse(body) : body;
      }

      const result = await handler({
        ...context,
        seasonId: data.seasonId,
        payload
      });

      return new Response(JSON.stringify({
        success: true,
        data: result,
        traceId
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      console.error(`[API Error] ${traceId}:`, err);
      return new Response(JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
        traceId
      }), {
        status: err.name === 'ZodError' ? 400 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}
