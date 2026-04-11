from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from newZRL.models.league import League  # modello League con SQLAlchemy
from .bp import admin_bp  # Import diretto


@admin_bp.route("/leagues/manage", methods=["GET", "POST"])
@login_required
def manage_leagues():
    if current_user.role != "admin":
        flash("⛔ Accesso riservato agli amministratori", "danger")
        return redirect(url_for("auth.login"))

    if request.method == "POST":
        action = request.form.get("action")
        league_id = request.form.get("league_id")
        name = request.form.get("name").strip()
        type_ = request.form.get("type").strip()
        region = request.form.get("region").strip()

        if action == "create":
            new_league = League(name=name, type=type_, region=region)
            db.session.add(new_league)
            db.session.commit()
            flash("✅ Lega creata correttamente", "success")

        elif action == "update":
            league = League.query.get(league_id)
            league.name = name
            league.type = type_
            league.region = region
            db.session.commit()
            flash("💾 Modifiche salvate", "success")

        elif action == "delete":
            league = League.query.get(league_id)
            db.session.delete(league)
            db.session.commit()
            flash("🗑️ Lega eliminata", "warning")

        return redirect(url_for("admin.manage_leagues"))

    leagues = League.query.order_by(League.type, League.region, League.name).all()
    return render_template("admin/manage_leagues.html", leagues=leagues)
