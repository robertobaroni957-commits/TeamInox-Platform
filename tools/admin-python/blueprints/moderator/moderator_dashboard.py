# routes/moderator.py

from flask import Blueprint, render_template, session
from datetime import datetime
from models.rounds import get_current_round
from models.races import get_races_by_round
from models.teams import get_all_teams

moderator_bp = Blueprint("moderator", __name__, url_prefix="/moderator")

@moderator_bp.route("/dashboard")
def dashboard():
    # Recupera round attivo
    current_round = get_current_round()
    races = get_races_by_round(current_round["id"]) if current_round else []

    # Recupera tutti i team
    teams = get_all_teams()

    # Passa tutto al template
    return render_template(
        "moderator_dashboard.html",
        current_round=current_round,
        races=races,
        teams=teams,
        race_date=current_round["date"] if current_round else None,
        current_time=datetime.utcnow()
    )
