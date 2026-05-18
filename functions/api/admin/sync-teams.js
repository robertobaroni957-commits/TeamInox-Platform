import { ZRLService } from '../../../src/services/zrlService';

export async function onRequestPost({ request, env }) {
    const service = new zrlService(env.ZRL_DB);
    try {
        const body = await request.json().catch(() => ({}));
        const seasonId = body.seasonId || 19;
        
        const response = await fetch(`https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist&test=dGVhbWxpc3Q%3D`, {
            headers: { 
                "accept": "application/json",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "cookie": env.WTRL_COOKIE || ""
            }
        });

        if (!response.ok) throw new Error(`WTRL API error ${response.status}`);
        const data = await response.json();
        
        const inoxTeams = (data.payload || []).filter(t => {
            const cid = t.clubId || t.club_id;
            const name = (t.teamname || t.name || "").toUpperCase();
            return cid === "cef70cde-9149-43a2-b3ae-187643a44703" || (name.includes("INOX") && !name.includes("EQUINOX"));
        });

        await service.syncTeams(inoxTeams);

        return new Response(JSON.stringify({ success: true, count: inoxTeams.length }), { 
            headers: { "Content-Type": "application/json" } 
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}

