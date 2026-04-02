// functions/api/admin/delete_user.js
export async function onRequestPost({ request, env }) {
    // Il middleware ha già garantito l'accesso per il ruolo 'admin'
    try {
        const { userId } = await request.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
        }

        // Eliminiamo l'atleta
        await env.DB.prepare("DELETE FROM athletes WHERE zwid = ?").bind(userId).run();

        return new Response(JSON.stringify({ success: true, message: "Utente eliminato correttamente" }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
