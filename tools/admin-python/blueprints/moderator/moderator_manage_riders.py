from flask import Blueprint, render_template, request, flash, redirect, url_for
from utils.auth_decorators import require_role, get_db

moderator_teams = Blueprint("moderator_teams", __name__, template_folder="../../../templates/moderator")

require_moderator = require_role("moderator", "admin")

@moderator_teams.route("/moderator/team/<int:team_id>/members", methods=["GET", "POST"])
@require_moderator
def manage_team_members(team_id):
    conn = get_db()
    cur = conn.cursor()

    # Recupera informazioni team
    team = cur.execute("SELECT * FROM teams WHERE id=?", (team_id,)).fetchone()

    # Rider già assegnati al team
    riders = cur.execute("SELECT * FROM riders WHERE team_id=?", (team_id,)).fetchall()
    assigned_rider_ids = [r['zwift_power_id'] for r in riders]

    # Capitano
    captain = next((r for r in riders if r['is_captain']), None)

    # Rider disponibili per categoria
    category_riders = cur.execute("SELECT * FROM riders WHERE category=? AND team_id IS NULL ORDER BY name", (team['category'],)).fetchall()

    if request.method == "POST":
        action = request.form.get("action")
        rider_id = request.form.get("rider_id")
        if action == "add_rider" and rider_id:
            cur.execute("UPDATE riders SET team_id=? WHERE zwift_power_id=?", (team_id, rider_id))
            conn.commit()
            flash("✅ Rider aggiunto", "success")
        elif action == "remove_rider" and rider_id:
            cur.execute("UPDATE riders SET team_id=NULL WHERE zwift_power_id=?", (rider_id,))
            conn.commit()
            flash("🗑️ Rider rimosso", "warning")
        return redirect(url_for("moderator_teams.manage_team_members", team_id=team_id))

    return render_template(
        "moderator_team_members.html",
        team=team,
        riders=riders,
        captain=captain,
        category_riders=category_riders,
        assigned_rider_ids=assigned_rider_ids
    )
