import os
import sqlite3
from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from utils.auth_decorators import require_captain

def get_zrl_db():
    """Connessione al DB zrl.db"""
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DB_PATH = os.path.join(BASE_DIR, "zrl.db")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Blueprint capitano
lineup_bp = Blueprint("lineup_captain", __name__, url_prefix="/captain")

# ================================
# Gestione formazione team
# ================================
@lineup_bp.route("/lineup/<int:team_id>/<race_date>", methods=["GET", "POST"])
@require_captain
def manage_lineup(team_id, race_date):
    zwift_id = session.get("zwift_id")
    if not zwift_id:
        flash("❌ Accesso non autorizzato", "danger")
        return redirect(url_for("auth.login"))

    conn = get_zrl_db()
    cur = conn.cursor()

    # 🔹 Verifica che il capitano gestisca questo team
    captain_team = cur.execute("""
        SELECT rt.team_id
        FROM rider_teams rt
        JOIN riders r ON r.zwift_power_id = rt.zwift_power_id
        WHERE r.zwift_power_id = ? AND r.is_captain = 1
    """, (zwift_id,)).fetchone()

    if not captain_team or captain_team["team_id"] != team_id:
        flash("❌ Non puoi gestire la formazione di un altro team", "danger")
        conn.close()
        return redirect(url_for("captain_panel.captain_dashboard"))

    # 🔹 Recupera info gara
    race = cur.execute("SELECT * FROM races WHERE race_date = ?", (race_date,)).fetchone()
    if not race:
        flash("⚠️ Gara non trovata.", "danger")
        conn.close()
        return redirect(url_for("captain_panel.captain_dashboard"))

    # 🔹 Rider disponibili tramite rider_teams
    riders = cur.execute("""
        SELECT r.zwift_power_id AS rider_id, r.name, r.category
        FROM riders r
        JOIN rider_teams rt ON r.zwift_power_id = rt.zwift_power_id
        WHERE r.active = 1 AND rt.team_id = ?
        ORDER BY r.name
    """, (team_id,)).fetchall()

    # 🔹 Rider già selezionati
    selected_ids = [row["zwift_power_id"] for row in cur.execute("""
        SELECT zwift_power_id
        FROM race_lineup
        WHERE team_id = ? AND race_date = ?
    """, (team_id, race_date)).fetchall()]

    # 🔹 Rider bloccati (in altre gare lo stesso giorno)
    blocked_ids = [row["zwift_power_id"] for row in cur.execute("""
        SELECT zwift_power_id
        FROM race_lineup
        WHERE race_date = ? AND team_id != ?
    """, (race_date, team_id)).fetchall()]

    # 🔹 POST: aggiornamento formazione
    if request.method == "POST":
        try:
            new_selection = [int(rid) for rid in request.form.getlist("rider_ids")]
        except ValueError:
            flash("❌ Selezione non valida.", "danger")
            conn.close()
            return redirect(url_for("lineup_captain.manage_lineup", team_id=team_id, race_date=race_date))

        if len(new_selection) > 6:
            flash("⚠️ Puoi selezionare al massimo 6 corridori.", "warning")
            conn.close()
            return redirect(url_for("lineup_captain.manage_lineup", team_id=team_id, race_date=race_date))

        valid_selection = [rid for rid in new_selection if rid not in blocked_ids]

        # Aggiorna la lineup
        cur.execute("DELETE FROM race_lineup WHERE team_id = ? AND race_date = ?", (team_id, race_date))
        for rider_id in valid_selection:
            cur.execute("""
                INSERT INTO race_lineup (team_id, zwift_power_id, race_date)
                VALUES (?, ?, ?)
            """, (team_id, rider_id, race_date))

        conn.commit()
        flash("✅ Formazione aggiornata con successo.", "success")
        conn.close()
        return redirect(url_for("lineup_captain.manage_lineup", team_id=team_id, race_date=race_date))

    # 🔹 Recupera nome team
    team_name_row = cur.execute("SELECT name FROM teams WHERE id = ?", (team_id,)).fetchone()
    team_name = team_name_row["name"] if team_name_row else "Team Sconosciuto"

    conn.close()
    return render_template("captain/manage_lineup.html",
                           page_title="Gestione Formazione",
                           team_id=team_id,
                           team_name=team_name,
                           race_date=race_date,
                           race=race,
                           riders=riders,
                           selected_ids=selected_ids,
                           blocked_ids=blocked_ids)
