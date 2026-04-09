import bcrypt from 'bcryptjs';

export async function onRequestGet(context) {
  const { env } = context;
  const email = "admin@teaminox.it";
  const password = "admin123";
  const zwid = 1;

  try {
    const hash = await bcrypt.hash(password, 10);
    
    // Eliminiamo se esiste già per evitare conflitti
    await env.DB.prepare("DELETE FROM athletes WHERE email = ? OR zwid = ?")
      .bind(email, zwid)
      .run();

    await env.DB.prepare(
      "INSERT INTO athletes (zwid, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
    ).bind(zwid, "Admin Team Inox", email, hash, "admin").run();

    return new Response(JSON.stringify({ success: true, message: "Admin creato con successo!" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500
    });
  }
}
