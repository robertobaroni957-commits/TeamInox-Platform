// src/index.ts
// Questo Worker è necessario per soddisfare la build di Cloudflare,
// ma non deve interferire con le Functions di Pages nella cartella /functions.

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    // Se la richiesta è per l'API, e questo Worker venisse chiamato per errore,
    // cerchiamo di non bloccare la richiesta. 
    // In un setup Pages corretto, questo file non dovrebbe nemmeno essere invocato per /api.
    if (url.pathname.startsWith('/api')) {
      return new Response("API Forwarding...", { status: 200 });
    }

    return new Response("Inoxteam Platform Worker Active", { status: 200 });
  },
};
