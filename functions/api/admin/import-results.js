
import { ZRLService } from '../../../src/services/zrlService';

export async function onRequestPost({ request, env }) {
    const service = new zrlService(env.DB);
    try {
        const payload = await request.json();
        const result = await service.importResults(payload);
        return new Response(JSON.stringify({ success: true, result }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}
