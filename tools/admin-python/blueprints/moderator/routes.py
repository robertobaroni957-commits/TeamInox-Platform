from flask import Blueprint, render_template, flash, session
from utils.auth_decorators import require_moderator
from datetime import datetime
from models.rounds import get_current_round
from models.races import get_races_by_round
from models.teams import get_all_teams

moderator_bp = Blueprint(
    "moderator",
    __name__,
    template_folder="../../templates/moderator",
    url_prefix="/moderator"
)

# ==========================
# 🧭 Dashboard Moderatore
# ==========================
@moderator_bp.route("/dashboard")
@require_moderator
def dashboard():
    current_round = get_current_round()
    if not current_round:
        flash("⚠️ Nessun round attivo trovato.", "warning")
        races = []
        race_date = None
    else:
        races = get_races_by_round(current_round["id"])
        race_date = current_round.get("date")

    teams = get_all_teams()
    return render_template(
        "moderator/moderator_dashboard.html",
        current_round=current_round,
        races=races,
        teams=teams,
        race_date=race_date,
        current_time=datetime.utcnow()
    )

# ==========================
# 👑 Gestione Capitani
# ==========================
@moderator_bp.route("/captains", methods=["GET", "POST"])
@require_moderator
def manage_captains():
    return render_template("moderator/manage_captains.html")

# ==========================
# 🏁 Gestione Gare
# ==========================
@moderator_bp.route("/races", methods=["GET", "POST"])
@require_moderator
def manage_races():
    return render_template("moderator/manage_races.html")

# ==========================
# 🏆 Visualizza Risultati
# ==========================
@moderator_bp.route("/results")
@require_moderator
def view_results():
    return render_template("moderator/view_results.html")

# ==========================
# 🚴 Gestione Team
# ==========================
@moderator_bp.route("/teams")
@require_moderator
def manage_teams():
    # Reindirizza al blueprint specifico dei team
    from .moderator_teams import manage_teams as mt
    return mt()

# ==========================
# 📅 Dettaglio Gara
# ==========================
@moderator_bp.route("/race/<int:race_id>/details")
@require_moderator
def race_details(race_id):
    return render_template("moderator/race_details.html", race_id=race_id)
