# newZRL/blueprints/admin/imports.py
from flask import Blueprint, render_template, request, redirect, url_for, flash
from newZRL import db
from newZRL.models import Round
from datetime import datetime
import re

admin_imports_bp = Blueprint("admin_imports", __name__, url_prefix="/admin/imports")

MONTHS = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
}

def parse_date(date_str, default_year):
    m = re.search(r"(\d+)(?:st|nd|rd|th)? (\w+)", date_str)
    if m:
        day, mon = int(m.group(1)), m.group(2)
        month_num = MONTHS.get(mon, 1)
        return datetime(default_year, month_num, day).date()
    return None

def extract_round_number(name):
    match = re.search(r"(\d+)", name)
    return int(match.group(1)) if match else 0

def extract_rounds(text):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    rounds = []
    current_year = datetime.now().year
    i = 0
    while i < len(lines):
        name = lines[i]
        start, end = None, None
        if i + 1 < len(lines):
            dates = lines[i + 1].split("-")
            if len(dates) == 2:
                start = parse_date(dates[0], current_year)
                end = parse_date(dates[1], current_year)
                if start and end and end < start:
                    end = parse_date(dates[1], current_year + 1)
        if start and end:
            rounds.append((name, start, end))
        i += 2
    return rounds

@admin_imports_bp.route("/import_rounds", methods=["GET", "POST"], endpoint="import_rounds")
def import_rounds_view():
    existing_rounds = Round.query.order_by(Round.season_id, Round.round_number).all()

    if request.method == "POST":
        try:
            season = int(request.form.get("season"))
        except (TypeError, ValueError):
            flash("⚠️ Inserisci una stagione valida", "warning")
            return redirect(url_for("admin_imports.import_rounds"))

        raw_text = request.form.get("rounds_text")
        rounds = extract_rounds(raw_text)

        if not rounds:
            flash("⚠️ Nessun round valido trovato nel testo", "warning")
            return redirect(url_for("admin_imports.import_rounds"))

        inserted, skipped = 0, 0
        for name, start, end in rounds:
            round_number = extract_round_number(name)
            exists = Round.query.filter_by(season_id=season, name=name).first()
            if exists:
                skipped += 1
                continue
            new_round = Round(
                season_id=season,
                round_number=round_number,
                name=name,
                start_date=start,
                end_date=end,
                is_active=True
            )
            db.session.add(new_round)
            inserted += 1

        db.session.commit()
        flash(f"✅ Importati {inserted} nuovi round. ⏩ {skipped} già presenti.", "success")
        return redirect(url_for("admin_imports.import_rounds"))

    return render_template("admin/import_rounds.html", existing_rounds=existing_rounds)

@admin_imports_bp.route("/update_round/<int:round_id>", methods=["POST"])
def update_round(round_id):
    round_obj = Round.query.get_or_404(round_id)
    round_obj.name = request.form.get("name")
    round_obj.start_date = request.form.get("start_date")
    round_obj.end_date = request.form.get("end_date")
    round_obj.is_active = bool(request.form.get("is_active") == "on")

    db.session.commit()
    flash("✅ Round aggiornato con successo.", "success")
    return redirect(url_for("admin_imports.import_rounds"))

@admin_imports_bp.route("/delete_round/<int:round_id>", methods=["POST"])
def delete_round(round_id):
    round_obj = Round.query.get_or_404(round_id)
    db.session.delete(round_obj)
    db.session.commit()

    flash("🗑️ Round eliminato con successo.", "info")
    return redirect(url_for("admin_imports.import_rounds"))
