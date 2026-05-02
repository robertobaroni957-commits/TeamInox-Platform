// functions/api/admin/delete_user.js
export async function onRequestPost({ request, env }) {
    // Il middleware ha già garantito l'accesso per il ruolo 'admin'
    try {
        const { userId } = await request.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
        }

        // Eliminiamo l'atleta e tutti i dati correlati
        await env.DB.batch([
            env.DB.prepare("DELETE FROM team_members WHERE athlete_id = ?").bind(userId),
            env.DB.prepare("DELETE FROM race_lineup WHERE athlete_id = ?").bind(userId),
            env.DB.prepare("DELETE FROM availability WHERE athlete_id = ?").bind(userId),
            env.DB.prepare("DELETE FROM user_time_preferences WHERE zwid = ?").bind(userId),
            env.DB.prepare("DELETE FROM athletes WHERE zwid = ?").bind(userId)
        ]);

        return new Response(JSON.stringify({ success: true, message: "Utente e dati correlati eliminati correttamente" }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
