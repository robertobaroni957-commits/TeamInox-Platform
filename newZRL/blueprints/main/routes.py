# newZRL/blueprints/main/routes.py
from flask import Blueprint, render_template, redirect, url_for
from flask_login import current_user, login_required

main_bp = Blueprint("main", __name__)

def redirect_based_on_role():
    """Helper per redirect automatico in base al ruolo dell'utente."""
    if current_user.is_authenticated:
        role = getattr(current_user, "role", None)
        if role == "admin":
            return redirect(url_for("admin.dashboard"))
        elif role == "captain":
            return redirect(url_for("admin_teams.manage_teams"))
    # Se non loggato o ruolo sconosciuto
    return None

@main_bp.route("/")
def index():
    """Route principale: redirect automatico o login."""
    redirect_resp = redirect_based_on_role()
    if redirect_resp:
        return redirect_resp
    return redirect(url_for("auth.login"))

@main_bp.route("/welcome")
def welcome():
    """Pagina di benvenuto per utenti non loggati."""
    redirect_resp = redirect_based_on_role()
    if redirect_resp:
        return redirect_resp
    return render_template("welcome.html")
