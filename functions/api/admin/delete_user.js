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

        // Eliminiamo l'utente e i suoi dati correlati (se necessario)
        // Nota: Qui andrebbe usata una transazione se vogliamo eliminare anche da 'athletes'
        await env.DB.batch([
            env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId),
            // Se esiste un record atleta con lo stesso zwid (estratto dal database prima della cancellazione)
            // lo eliminiamo qui. Altrimenti l'admin può farlo manualmente dalla lista atleti.
        ]);

        return new Response(JSON.stringify({ success: true, message: "Utente eliminato correttamente." }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
