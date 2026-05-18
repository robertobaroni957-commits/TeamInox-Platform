export async function runWithGuard(
  context: any, 
  guardFn: () => Promise<{ valid: boolean; reason?: string }>,
  legacyHandler: (ctx: any) => Promise<Response>,
  eventName: string
): Promise<Response> {
  const { valid, reason } = await guardFn();
  if (!valid) {
    return new Response(JSON.stringify({ success: false, error: reason }), { 
      status: 403,
      headers: { "Content-Type": "application/json" } 
    });
  }

  const response = await legacyHandler(context);
  
  if (response.status === 200) {
    context.waitUntil(
      import("./EventLogger").then(m => m.logZRLEvent(context.env.ZRL_DB, eventName, context.request.url))
    );
  }
  
  return response;
}
