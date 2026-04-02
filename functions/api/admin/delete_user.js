// functions/api/admin/delete_user.js
export async function onRequestPost(context) {
    const { request, env } = context;
    const user = context.data?.user;

    // Solo l'admin può eliminare
    if (user?.role !== 'admin') {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const { userId } = await request.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
        }

        // Eliminiamo l'atleta
        await env.DB.prepare("DELETE FROM athletes WHERE zwid = ?").bind(userId).run();

        return new Response(JSON.stringify({ success: true, message: "Utente eliminato correttamente." }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
