// @ts-check
import { SeasonActionService } from "../../../../../src/services/SeasonActionService";

export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();

    try {
        const result = await SeasonActionService.execute(env.ZRL_DB, 'CLEANUP_ROSTER', body);
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 403 });
    }
}
