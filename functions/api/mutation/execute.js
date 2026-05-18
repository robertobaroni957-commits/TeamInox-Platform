import { runMutation } from "../../../src/services/db/mutation";
import { routeMutation } from "../../../src/services/db/MutationRouter";

export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const { intent, securityContext } = await request.json();

    if (!securityContext || !securityContext.idempotencyKey) {
        return new Response(JSON.stringify({ success: false, error: "Missing idempotencyKey" }), { status: 400 });
    }

    // 1. Idempotency Check (Simplified: checking if this key exists in outbox)
    const existing = await env.ZRL_DB.prepare(
      "SELECT id FROM zrl_outbox_events WHERE payload LIKE ?"
    ).bind(`%${securityContext.idempotencyKey}%`).first();

    if (existing) {
      return new Response(JSON.stringify({ 
        success: true, 
        status: 'ALREADY_PROCESSED',
        message: "Request already processed" 
      }), { headers: { "Content-Type": "application/json" } });
    }

    // 2. Resolve Intent (Mapping intent to SQL statements)
    const mutation = await routeMutation(env.ZRL_DB, intent);
    
    // 3. Execution (Kernel - Atomic batch with Outbox)
    await runMutation(env.ZRL_DB, mutation);

    return new Response(JSON.stringify({
      success: true,
      mutationType: intent.type,
      status: 'COMMITTED'
    }), { headers: { "Content-Type": "application/json" } });
    
  } catch (err) {
    console.error("[MutationKernel] Error:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message 
    }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
