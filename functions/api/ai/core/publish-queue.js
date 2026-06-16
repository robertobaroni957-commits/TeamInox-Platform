/**
 * AI Publish Queue Producer
 * Offloads distribution tasks to Cloudflare Queues for async processing.
 */
export async function enqueuePublishJob(env, reportData) {
    if (!env.PUBLISH_QUEUE) {
        console.warn("[QUEUE] No PUBLISH_QUEUE binding found. Falling back to sync logs.");
        return false;
    }

    const payload = {
        report_id: reportData.hash,
        report_type: reportData.report_type,
        channels: ["internal", "discord", "webhook"],
        content: reportData.content,
        metadata: reportData.metadata,
        timestamp: Date.now(),
        idempotency_key: `pub_${reportData.hash}`
    };

    try {
        await env.PUBLISH_QUEUE.send(payload, { contentType: "json" });
        return true;
    } catch (err) {
        console.error(`[QUEUE_ERROR] Failed to enqueue: ${err.message}`);
        return false;
    }
}
