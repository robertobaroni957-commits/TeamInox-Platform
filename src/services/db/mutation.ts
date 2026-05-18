// src/services/db/mutation.ts
import { Mutation } from './mutationDSL';

/**
 * Kernel execution function.
 * Ensures SQL mutation and Outbox insertion occur in a single atomic batch.
 */
export async function runMutation<T>(db: any, mutation: Mutation<T>) {
  if (!mutation.statements || !mutation.event) {
    throw new Error("FATAL: Mutation definition invalid (Missing statements or event)");
  }

  // 1. Prepare SQL Statements from DSL
  const preparedLegacyStmts = mutation.statements.map((s: any) => {
    if (s.sql && s.bind) {
      // D1 doesn't support 'undefined' in bind(), must convert to null
      const sanitizedBind = s.bind.map((v: any) => v === undefined ? null : v);
      return db.prepare(s.sql).bind(...sanitizedBind);
    }
    return s; // Already a D1PreparedStatement
  });

  // 2. Prepare Outbox insertion
  const outboxStmt = db.prepare(
    "INSERT INTO zrl_outbox_events (event_type, payload, status) VALUES (?, ?, 'PENDING')"
  ).bind(mutation.event.eventType, JSON.stringify(mutation.event.payload));

  // 3. Atomic batch: SQL Mutations + Audit Intent
  return await db.batch([
    ...preparedLegacyStmts,
    outboxStmt
  ]);
}

/**
 * Hardened DB Proxy
 * Prevents unauthorized SQL execution at runtime.
 */
export function createHardenedDB(originalDB: any, isEnforced: boolean) {
  return new Proxy(originalDB, {
    get(target, prop) {
      if (isEnforced && (prop === "prepare" || prop === "batch" || prop === "exec")) {
        throw new Error("FATAL: DIRECT DB ACCESS BLOCKED - USE runMutation()");
      }
      return target[prop];
    }
  });
}
