export async function logZRLEvent(db: any, stepName: string, metadata: string) {
  try {
    await db.prepare(
      "INSERT INTO zrl_season_events (step_name, event_type, payload) VALUES (?, ?, ?)"
    ).bind(stepName, 'LEGACY_EXECUTION', metadata).run();
  } catch (e) {
    console.error("Non-blocking log failed:", e);
  }
}
