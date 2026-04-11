from flask import render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from .bp import admin_bp  # Import diretto
from newZRL.models.team import Team
from newZRL.models.round import Round
from newZRL.models.race import Race
from newZRL import db
from datetime import date
from newZRL.utils.serializers import serialize_model


@admin_bp.route("/dashboard")
@login_required
def dashboard():
    if current_user.role != "admin":
        flash("⛔ Accesso riservato agli amministratori", "danger")
        return redirect(url_for("auth.login"))

    today = date.today()

    # 🔹 Round attivo
    current_round = (
        Round.query
        .filter(Round.end_date >= today)
        .order_by(Round.end_date.asc())
        .first()
    )

    # 🔹 Gare del round attivo
    races = []
    if current_round:
        races = (
            Race.query
            .filter_by(round_id=current_round.id)
            .order_by(Race.race_date.asc())
            .all()
        )

    # 🔹 Serializzazione gare per uso in JavaScript
    races_serialized = [serialize_model(race) for race in races]

    # 🔹 Tutti i team e info capitani
    teams_list = []
    for team in Team.query.all():
        captain_name = next(
            (member.name for member in team.members if member.role == "captain"),
            None
        )
        teams_list.append({
            "id": team.id,
            "name": team.name,
            "category": team.category,
            "division": team.division,
            "captain_name": captain_name,
            "rider_count": len(team.members),
            "has_lineup": hasattr(team, "has_lineup") and team.has_lineup,
            "empty": False
        })

    # 🔹 Fino a 16 card (placeholder vuoti completi)
    while len(teams_list) < 16:
        teams_list.append({
            "id": None,
            "name": None,
            "category": None,
            "division": None,
            "captain_name": None,
            "rider_count": 0,
            "has_lineup": False,
            "empty": True
        })

    return render_template(
        "admin/admin_dashboard.html",
        teams=teams_list,
        races=races_serialized,
        current_round=current_round,
        current_time=today
    )
