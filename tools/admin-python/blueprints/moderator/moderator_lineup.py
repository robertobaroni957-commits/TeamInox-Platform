from flask import Blueprint, render_template, request, flash, redirect, url_for
from utils.auth_decorators import require_role, get_db

moderator_lineup = Blueprint(
    "moderator_lineup",
    __name__,
    template_folder="../../../templates/moderator"
)

require_moderator = require_role("moderator", "admin")

@moderator_lineup.route("/moderator/lineup/<int:team_id>/<race_date>", methods=["GET", "POST"])
@require_moderator
def manage_lineup(team_id, race_date):
    conn = get_db()
    cur = conn.cursor()

    # Recupera rider disponibili per il team e la gara
    riders = cur.execute("""
        SELECT * FROM riders WHERE team_id=? ORDER BY name
    """, (team_id,)).fetchall()

    # Rider già assegnati
    selected_ids = [r['zwift_power_id'] for r in riders if r.get('assigned', False)]
    busy_riders = [r['zwift_power_id'] for r in riders if r.get('busy', False)]
    
    assigned_captain = next((r['name'] for r in riders if r.get('is_captain')), None)

    if request.method == "POST":
        action = request.form.get("action")
        if action == "assign_captain":
            captain_id = request.form.get("captain_id")
            cur.execute("UPDATE riders SET is_captain=0 WHERE team_id=?", (team_id,))
            cur.execute("UPDATE riders SET is_captain=1 WHERE zwift_power_id=?", (captain_id,))
            flash("✅ Capitano assegnato", "success")

        elif action == "save_lineup":
            rider_ids = request.form.getlist("riders")
            cur.execute("UPDATE riders SET assigned=0 WHERE team_id=?", (team_id,))
            for r_id in rider_ids:
                cur.execute("UPDATE riders SET assigned=1 WHERE zwift_power_id=?", (r_id,))
            flash("💾 Formazione salvata", "success")

        elif action == "remove_rider":
            remove_id = request.form.get("remove_id")
            cur.execute("UPDATE riders SET assigned=0 WHERE zwift_power_id=?", (remove_id,))
            flash("🗑️ Rider rimosso", "info")

        conn.commit()
        return redirect(url_for("moderator_lineup.manage_lineup", team_id=team_id, race_date=race_date))

    # Template
    category_colors = {"A": "bg-danger", "B": "bg-success", "C": "bg-info", "D": "bg-warning"}
    return render_template(
        "moderator_team_lineup.html",
        team_id=team_id,
        race_date=race_date,
        riders=riders,
        assigned_captain=assigned_captain,
        selected_ids=selected_ids,
        busy_riders=busy_riders,
        category_colors=category_colors,
        team_name="Team XYZ"  # eventualmente recuperare dal DB
    )
