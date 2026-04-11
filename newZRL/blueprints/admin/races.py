# newZRL/blueprints/admin/races.py
from flask import render_template, request, redirect, url_for, flash, session
from flask_login import current_user, login_required
from .bp import admin_bp
from newZRL.models.race import Race
from newZRL.models.round import Round
from newZRL.models.season import Season
from newZRL.models.team import Team
from newZRL.models.rider import Rider
from newZRL import db
from datetime import datetime

# ===========================
# Placeholder
# ===========================
@admin_bp.route("/races/placeholder")
@login_required
def placeholder():
    if current_user.role != "admin":
        flash("⛔ Accesso riservato agli amministratori", "danger")
        return redirect(url_for("auth.login"))
    return render_template("admin/placeholder.html")


# ===========================
# Visualizza stagioni e round
# ===========================
@admin_bp.route("/import_races")
@login_required
def import_races():
    if current_user.role != "admin":
        flash("⛔ Accesso riservato agli amministratori", "danger")
        return redirect(url_for("auth.login"))

    seasons = Season.query.order_by(Season.start_year.desc()).all()
    rounds = (
        db.session.query(Round, Season)
        .join(Season, Round.season_id == Season.id)
        .order_by(Round.start_date.asc())
        .all()
    )

    return render_template("admin/import_rounds.html", seasons=seasons, existing_rounds=rounds)


# ===========================
# Crea stagione
# ===========================
@admin_bp.route("/create_season", methods=["POST"])
@login_required
def create_season():
    if current_user.role != "admin":
        flash("⛔ Accesso riservato agli amministratori", "danger")
        return redirect(url_for("auth.login"))

    start_year = request.form.get("start_year", type=int)
    end_year = request.form.get("end_year", type=int)

    if not start_year or not end_year or end_year <= start_year:
        flash("⚠️ Anni non validi", "warning")
        return redirect(url_for("admin_bp.import_races"))

    existing = Season.query.filter_by(start_year=start_year, end_year=end_year).first()
    if existing:
        flash("⚠️ Stagione già esistente", "warning")
    else:
        season = Season(start_year=start_year, end_year=end_year)
        db.session.add(season)
        db.session.commit()
        flash("✅ Stagione creata correttamente", "success")

    return redirect(url_for("admin_bp.import_races"))


# ===========================
# Inserimento round
# ===========================
@admin_bp.route("/insert_round", methods=["POST"])
@login_required
def insert_round():
    if current_user.role != "admin":
        flash("⛔ Accesso riservato agli amministratori", "danger")
        return redirect(url_for("auth.login"))

    round_number = request.form.get("round_number", type=int)
    name = request.form.get("name")
    season_id = request.form.get("season_id", type=int)
    start_date = request.form.get("start_date")
    end_date = request.form.get("end_date")

    is_active = True if end_date >= datetime.today().strftime("%Y-%m-%d") else False

    new_round = Round(
        round_number=round_number,
        name=name,
        season_id=season_id,
        start_date=start_date,
        end_date=end_date,
        is_active=is_active
    )
    db.session.add(new_round)
    db.session.commit()
    flash("✅ Round inserito correttamente", "success")
    return redirect(url_for("admin_bp.import_races"))
