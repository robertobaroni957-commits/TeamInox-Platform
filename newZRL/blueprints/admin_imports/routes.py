# newZRL/blueprints/admin_imports/routes.py
import os
import shutil
import datetime
import sqlite3
from flask import Blueprint, render_template, request, redirect, url_for, flash
import pandas as pd
from newZRL import db
from newZRL.models import Rider, Round  # aggiungi altri modelli se serve

admin_imports_bp = Blueprint("admin_imports", __name__, url_prefix="/admin/import")

# 🔹 Percorsi principali
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
CSV_FILE = os.path.join(DATA_DIR, "riders.csv")
JSON_FILE = os.path.join(DATA_DIR, "riders.json")
ZRL_DB_FILE = os.path.join(PROJECT_ROOT, "zrl.db")
BACKUP_DIR = os.path.join(PROJECT_ROOT, "backups")

# --- Helper ---
def backup_db():
    """Crea backup del DB ZRL."""
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"zrl_backup_{timestamp}.db")
    shutil.copy2(ZRL_DB_FILE, backup_file)
    return backup_file

def get_zrl_conn():
    """Connessione SQLite DB ZRL."""
    conn = sqlite3.connect(ZRL_DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def read_riders_file():
    """Legge CSV o JSON dei rider."""
    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
    elif os.path.exists(JSON_FILE):
        df = pd.read_json(JSON_FILE)
    else:
        return None
    df["zwift_power_id"] = df["zwift_power_id"].astype(str)
    return df

# ==============================
# ROUTE: Import ZRL Riders
# ==============================
@admin_imports_bp.route("/zrl_riders", methods=["GET", "POST"])
def import_zrl_riders():
    df = read_riders_file()
    if df is None:
        flash("❌ Nessun file riders.csv o riders.json trovato.", "danger")
        return render_template("admin/import_zrl_riders.html", zwift_riders=[], selected_category="")

    conn = get_zrl_conn()
    cur = conn.cursor()

    if request.method == "POST":
        selected_ids = request.form.getlist("rider_ids")
        new_riders, updated_riders = 0, 0

        df["zwift_power_id"] = df["zwift_power_id"].astype(str)
        for zwid in selected_ids:
            rider_row = df[df["zwift_power_id"] == zwid]
            if rider_row.empty:
                continue
            rider = rider_row.iloc[0]

            existing = cur.execute("SELECT 1 FROM riders WHERE zwift_power_id=?", (zwid,)).fetchone()
            if existing:
                cur.execute("""
                    UPDATE riders SET
                        name=?, category=?, ranking=?,
                        wkg_20min=?, watt_20min=?, wkg_15sec=?, watt_15sec=?,
                        status=?, races=?, weight=?, ftp=?, age=?, country=?, profile_url=?, available_zrl=1
                    WHERE zwift_power_id=?
                """, (
                    rider["name"], rider["category"], rider["ranking"],
                    rider["wkg_20min"], rider["watt_20min"], rider["wkg_15sec"], rider["watt_15sec"],
                    rider["status"], rider["races"], rider["weight"], rider["ftp"], rider["age"],
                    rider.get("country",""), rider.get("profile_url",""), zwid
                ))
                updated_riders += 1
            else:
                cur.execute("""
                    INSERT INTO riders (
                        zwift_power_id, name, category, ranking,
                        wkg_20min, watt_20min, wkg_15sec, watt_15sec,
                        status, races, weight, ftp, age, country, profile_url,
                        available_zrl, is_captain, email, password,
                        active, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    rider["zwift_power_id"], rider["name"], rider["category"], rider["ranking"],
                    rider["wkg_20min"], rider["watt_20min"], rider["wkg_15sec"], rider["watt_15sec"],
                    rider["status"], rider["races"], rider["weight"], rider["ftp"], rider["age"],
                    rider.get("country",""), rider.get("profile_url",""),
                    1, 0, "", "", 1, datetime.datetime.now().strftime("%Y-%m-%d")
                ))
                new_riders += 1

        conn.commit()
        conn.close()
        flash(f"✅ Rider importati: {new_riders}, Rider aggiornati: {updated_riders}", "success")
        return redirect(url_for("admin_imports.import_zrl_riders"))

    selected_category = request.args.get("category", "").upper()
    if selected_category:
        if selected_category == "A":
            df = df[df["category"].isin(["A","A+"])]
        elif selected_category == "NESSUNA":
            df = df[df["category"].isna() | (df["category"]=="")]
        else:
            df = df[df["category"] == selected_category]

    zwift_riders = df.to_dict(orient="records")
    return render_template("admin/import_zrl_riders.html",
                           zwift_riders=zwift_riders,
                           selected_category=selected_category)

# ==============================
# ROUTE: Import WTRL Races
# ==============================
@admin_imports_bp.route("/wtrl_races", methods=["GET", "POST"])
def import_wtrl_races():
    if request.method == "POST":
        round_id = request.form.get("round_id")
        round_url = request.form.get("round_url")

        if not round_id or not round_url:
            flash("⚠️ Round ID e URL WTRL sono obbligatori", "warning")
            return redirect(url_for("admin_imports.import_wtrl_races"))

        # TODO: inserire codice di parsing/import da WTRL
        # Esempio: races_data = parse_wtrl_url(round_url)
        # for race in races_data:
        #     db.session.add(Race(...))

        db.session.commit()
        flash(f"✅ Gare importate correttamente per il round {round_id}", "success")
        return redirect(url_for("admin_imports.import_wtrl_races"))

    return render_template("admin/import_wtrl_races.html")
