from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from newZRL import db
from newZRL.models.race import Race
from newZRL.models.team import Team
from newZRL.models.rider import Rider
from utils.auth_decorators import require_admin

admin_races_bp = Blueprint("admin_races", __name__, url_prefix="/admin")


@admin_races_bp.route("/manage_captains", methods=["GET", "POST"])
@require_admin
def manage_captains():
    selected_race = Race.query.filter_by(active=True).order_by(Race.race_date.asc()).first()
    selected_race_date = selected_race.race_date if selected_race else "N/D"

    if request.method == "POST":
        action = request.form.get("action")
        team_id = request.form.get("team_id", type=int)
        zwift_id = request.form.get("zwift_power_id", type=int)

        if action == "assign_captain" and team_id and zwift_id:
            team = Team.query.get(team_id)
            rider = Rider.query.filter_by(zwift_power_id=zwift_id).first()
            if team and rider:
                team.captain_zwift_id = zwift_id
                rider.is_captain = True
                db.session.commit()
                flash("👑 Capitano assegnato con successo!", "success")

        elif action == "remove_captain" and zwift_id:
            Team.query.filter_by(captain_zwift_id=zwift_id).update({"captain_zwift_id": None})
            # Verifica se è ancora capitano in altri team
            is_still_captain = Team.query.filter_by(captain_zwift_id=zwift_id).first()
            rider = Rider.query.filter_by(zwift_power_id=zwift_id).first()
            if rider:
                rider.is_captain = bool(is_still_captain)
                db.session.commit()
                flash("🧢 Capitano rimosso correttamente", "info")

        return redirect(url_for("admin_races.manage_captains"))

    selected_team_id = request.args.get("team_id", type=int)

    unassigned_riders = Rider.query.filter_by(is_captain=False).order_by(Rider.name.asc()).all()

    current_captains = (
        db.session.query(Rider)
        .join(Team, Rider.zwift_power_id == Team.captain_zwift_id)
        .distinct()
        .order_by(Rider.name.asc())
        .all()
    )

    return render_template(
        "admin/manage_captains.html",
        selected_race_date=selected_race_date,
        unassigned_riders=unassigned_riders,
        current_captains=current_captains,
        selected_team_id=selected_team_id
    )