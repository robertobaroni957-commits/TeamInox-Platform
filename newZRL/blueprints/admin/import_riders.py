from flask import Blueprint, render_template, request, redirect, url_for, flash
from newZRL.models import db, Rider
import pandas as pd
import datetime
import os

admin_import_riders_bp = Blueprint(
    "admin_import_riders",
    __name__,
    url_prefix="/admin/import"
)

# Percorsi file
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
CSV_FILE = os.path.join(DATA_DIR, "riders.csv")
JSON_FILE = os.path.join(DATA_DIR, "riders.json")

def read_riders_file():
    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
    elif os.path.exists(JSON_FILE):
        df = pd.read_json(JSON_FILE)
    else:
        return None
    df["zwift_power_id"] = df["zwift_power_id"].astype(str)
    return df

@admin_import_riders_bp.route("/zrl_riders", methods=["GET", "POST"])
def import_zrl_riders():
    df = read_riders_file()
    if df is None:
        flash("❌ Nessun file riders.csv o riders.json trovato.", "danger")
        return render_template("admin/import_zrl_riders.html", zwift_riders=[], selected_category="")

    if request.method == "POST":
        selected_ids = request.form.getlist("rider_ids")
        new_riders = 0
        updated_riders = 0

        for zwid in selected_ids:
            rider_row = df[df["zwift_power_id"] == zwid]
            if rider_row.empty:
                continue
            r = rider_row.iloc[0]

            existing = Rider.query.get(r["zwift_power_id"])
            if existing:
                # Aggiorna rider
                existing.name = r["name"]
                existing.category = r["category"]
                existing.ranking = r.get("ranking")
                existing.wkg_20min = r.get("wkg_20min")
                existing.watt_20min = r.get("watt_20min")
                existing.wkg_15sec = r.get("wkg_15sec")
                existing.watt_15sec = r.get("watt_15sec")
                existing.status = r.get("status")
                existing.races = r.get("races")
                existing.weight = r.get("weight")
                existing.ftp = r.get("ftp")
                existing.age = r.get("age")
                existing.country = r.get("country", "")
                existing.profile_url = r.get("profile_url", "")
                existing.available_zrl = True
                updated_riders += 1
            else:
                # Nuovo rider
                new_r = Rider(
                    zwift_power_id=r["zwift_power_id"],
                    name=r["name"],
                    category=r["category"],
                    ranking=r.get("ranking"),
                    wkg_20min=r.get("wkg_20min"),
                    watt_20min=r.get("watt_20min"),
                    wkg_15sec=r.get("wkg_15sec"),
                    watt_15sec=r.get("watt_15sec"),
                    status=r.get("status"),
                    races=r.get("races"),
                    weight=r.get("weight"),
                    ftp=r.get("ftp"),
                    age=r.get("age"),
                    country=r.get("country", ""),
                    profile_url=r.get("profile_url", ""),
                    available_zrl=True,
                    is_captain=False,
                    active=True,
                    created_at=datetime.datetime.now().strftime("%Y-%m-%d")
                )
                db.session.add(new_r)
                new_riders += 1

        db.session.commit()
        flash(f"✅ Rider importati: {new_riders}, Rider aggiornati: {updated_riders}", "success")
        return redirect(url_for("admin_import_riders.import_zrl_riders"))

    zwift_riders = df.to_dict(orient="records")
    selected_category = request.args.get("category", "")
    return render_template("admin/import_zrl_riders.html",
                           zwift_riders=zwift_riders,
                           selected_category=selected_category)
