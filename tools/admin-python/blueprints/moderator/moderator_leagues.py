from flask import Blueprint, render_template, request, flash, redirect, url_for
from utils.auth_decorators import require_role, get_db

moderator_leagues = Blueprint(
    "moderator_leagues",
    __name__,
    template_folder="../../../templates/moderator"
)

require_moderator = require_role("moderator", "admin")

@moderator_leagues.route("/moderator/leagues", methods=["GET", "POST"])
@require_moderator
def manage_leagues():
    conn = get_db()
    cur = conn.cursor()

    if request.method == "POST":
        action = request.form.get("action")
        league_id = request.form.get("league_id")
        name = request.form.get("name")
        type_ = request.form.get("type")
        region = request.form.get("region")

        if action == "create":
            cur.execute("INSERT INTO leagues (name, type, region) VALUES (?, ?, ?)", (name, type_, region))
            flash("✅ Lega creata", "success")
        elif action == "update" and league_id:
            cur.execute("UPDATE leagues SET name=?, type=?, region=? WHERE id=?", (name, type_, region, league_id))
            flash("💾 Lega aggiornata", "success")
        elif action == "delete" and league_id:
            cur.execute("DELETE FROM leagues WHERE id=?", (league_id,))
            flash("🗑️ Lega eliminata", "info")

        conn.commit()
        return redirect(url_for("moderator_leagues.manage_leagues"))

    leagues = cur.execute("SELECT * FROM leagues ORDER BY name").fetchall()
    conn.close()
    return render_template("moderator_manage_leagues.html", leagues=leagues)
