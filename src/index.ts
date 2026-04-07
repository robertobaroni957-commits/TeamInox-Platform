// Dummy file to satisfy wrangler build with proper types
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    return new Response("OK");
  },
};
