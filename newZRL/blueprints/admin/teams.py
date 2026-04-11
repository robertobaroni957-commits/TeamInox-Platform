# newZRL/blueprints/admin/teams.py
from flask import render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from .bp import admin_bp
from newZRL.models.user import User
from newZRL.models.team import Team
from newZRL.models.rider import Rider
from newZRL import db

def require_admin(func):
    """Decoratore locale se non usi quello vecchio"""
    from functools import wraps
    from flask import abort
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != "admin":
            flash("⛔ Accesso riservato agli amministratori", "danger")
            return redirect(url_for("auth.login"))
        return func(*args, **kwargs)
    return wrapper

@admin_bp.route("/teams", methods=["GET", "POST"])
@login_required
@require_admin
def manage_teams():
    if request.method == "POST":
        action = request.form.get("action")
        if action == "create":
            name = request.form["name"].strip()
            category = request.form["category"]
            division = request.form["division"]
            team = Team(name=name, category=category, division=division)
            db.session.add(team)
            db.session.commit()
            flash("✅ Team creato con successo!", "success")
        # puoi aggiungere update/delete simile
        return redirect(url_for("admin.manage_teams"))

    teams = Team.query.all()
    riders = Rider.query.filter_by(active=True).all()
    return render_template("admin/manage_teams.html", teams=teams, riders=riders)
