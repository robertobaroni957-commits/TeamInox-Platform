// src/index.ts - COMPLETAMENTE VUOTO PER EVITARE INTERFERENZE CON PAGES FUNCTIONS
// Questo file serve solo a far passare la build se Cloudflare lo richiede,
// ma non deve gestire nessuna richiesta.

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // Restituiamo 404 per forzare Cloudflare a cercare una rotta nelle Functions di Pages
    // se per qualche motivo questo Worker venisse invocato.
    return new Response("Not Found in Worker", { status: 404 });
  },
};
