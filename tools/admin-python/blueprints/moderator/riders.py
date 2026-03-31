from flask import Blueprint, render_template, request, flash, redirect, url_for
from utils.auth_decorators import require_role, get_db

moderator_lineup = Blueprint(
    "moderator_lineup",
    __name__,
    template_folder="../../../templates/moderator"
)

require_moderator = require_role("moderator", "admin")

@moderator_lineup.route("/moderator/team/<int:team_id>/lineup/<race_date>", methods=["GET", "POST"])
@require_moderator
def manage_lineup(team_id, race_date):
    conn = get_db()
    cur = conn.cursor()

    # Recupera tutti i rider del team
    riders = cur.execute("SELECT * FROM riders WHERE team_id=? ORDER BY name", (team_id,)).fetchall()

    # IDs dei rider selezionati
    selected_ids = [r["zwift_power_id"] for r in riders if r.get("assigned")]
    # IDs dei rider occupati in un’altra gara
    busy_riders = [r["zwift_power_id"] for r in riders if r.get("busy")]

    if request.method == "POST":
        action = request.form.get("action")
        if action == "save_lineup":
            rider_ids = request.form.getlist("riders")
            # Resetta selezione
            cur.execute("UPDATE riders SET assigned=0 WHERE team_id=?", (team_id,))
            for r_id in rider_ids:
                cur.execute("UPDATE riders SET assigned=1 WHERE zwift_power_id=?", (r_id,))
            flash("💾 Formazione salvata", "success")
            conn.commit()
            return redirect(url_for("moderator_lineup.manage_lineup", team_id=team_id, race_date=race_date))

    return render_template(
        "moderator_team_lineup.html",
        riders=riders,
        selected_ids=selected_ids,
        busy_riders=busy_riders,
        team_id=team_id,
        race_date=race_date,
        team_name="Team XYZ"  # oppure recuperare dal DB
    )
