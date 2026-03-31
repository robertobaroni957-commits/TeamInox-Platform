from flask import Blueprint, render_template, request, flash, redirect, url_for
from utils.auth_decorators import require_role, get_db

moderator_races = Blueprint(
    "moderator_races",
    __name__,
    template_folder="../../../templates/moderator"
)

require_moderator = require_role("moderator", "admin")

@moderator_races.route("/moderator/captains", methods=["GET", "POST"])
@require_moderator
def manage_captains():
    conn = get_db()
    cur = conn.cursor()

    # Recupera team disponibili
    available_teams = cur.execute("SELECT id, name FROM teams ORDER BY name").fetchall()
    selected_team_id = request.args.get("team_id", type=int)

    # Rider non assegnati
    unassigned_riders = []
    if selected_team_id:
        unassigned_riders = cur.execute("""
            SELECT zwift_power_id, name FROM users
            WHERE team_id = ? AND role='captain' = 0
        """, (selected_team_id,)).fetchall()

    # Capitani attuali
    current_captains = cur.execute("""
        SELECT u.zwift_power_id, u.name AS rider_name, t.name AS team_name
        FROM users u
        JOIN teams t ON u.team_id = t.id
        WHERE u.role='captain'
    """).fetchall()

    # Gestione POST
    if request.method == "POST":
        action = request.form.get("action")
        zwift_id = request.form.get("zwift_power_id")
        team_id = request.form.get("team_id")

        if action == "assign_captain" and zwift_id and team_id:
            cur.execute("UPDATE users SET role='captain' WHERE zwift_power_id=?", (zwift_id,))
            conn.commit()
            flash("✅ Capitano assegnato", "success")
        elif action == "remove_captain" and zwift_id:
            cur.execute("UPDATE users SET role='rider' WHERE zwift_power_id=?", (zwift_id,))
            conn.commit()
            flash("❌ Capitano rimosso", "info")

        return redirect(url_for("moderator_races.manage_captains", team_id=selected_team_id))

    conn.close()
    return render_template(
        "moderator_manage_captains.html",
        available_teams=available_teams,
        selected_team_id=selected_team_id,
        unassigned_riders=unassigned_riders,
        current_captains=current_captains,
    )
