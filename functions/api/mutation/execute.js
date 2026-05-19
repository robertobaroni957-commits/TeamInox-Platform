import { runMutation } from "../../../src/services/db/mutation";
import { routeMutation } from "../../../src/services/db/MutationRouter";
import { createLegacyAdapter } from "../admin/season/createLegacyAdapter";

async function legacyHandler(context) {
  const { env, request } = context;
  const { intent, securityContext } = await request.json();

  if (!securityContext || !securityContext.idempotencyKey) {
      throw new Error("Missing idempotencyKey");
  }

  // 1. Idempotency Check
  const existing = await env.ZRL_DB.prepare(
    "SELECT id FROM zrl_outbox_events WHERE payload LIKE ?"
  ).bind(`%${securityContext.idempotencyKey}%`).first();

  if (existing) {
    return { success: true, status: 'ALREADY_PROCESSED', message: "Request already processed" };
  }

  // 2. Resolve Intent
  const mutation = await routeMutation(env.ZRL_DB, intent);
  
  // 3. Execution
  await runMutation(env.ZRL_DB, mutation);

  return { mutationType: intent.type, status: 'COMMITTED' };
}

export const onRequestPost = createLegacyAdapter(legacyHandler);
