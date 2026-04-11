from flask import Blueprint, render_template
from newZRL.models.user import User
from newZRL.models.team import Team
from newZRL.models.user import db



admin_teams_bp = Blueprint("admin_teams", __name__, url_prefix="/admin/teams")

@admin_teams_bp.route("/", methods=["GET"])
def manage_teams():
    teams = Team.query.all()
    return render_template("admin_teams/manage_teams.html", teams=teams)
