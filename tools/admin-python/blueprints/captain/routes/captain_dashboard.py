from flask import Blueprint, render_template, session, redirect, url_for, flash
from db import get_zrl_db
from datetime import date
import sqlite3

captain_panel = Blueprint("captain_panel", __name__, url_prefix="/captain")

@captain_panel.route("/dashboard", endpoint="captain_dashboard")
def captain_dashboard():
    # ✅ Controllo accesso
    if not session.get("team_id"):
        flash("⛔ Nessun team assegnato", "warning")
        return redirect(url_for("auth.login_captain"))

    team_id = session.get("team_id")
    today = date.today()

    conn = get_zrl_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 🔹 Prossima gara
    race = cur.execute("""
        SELECT id, name, race_date
        FROM races
        WHERE race_date >= ?
        ORDER BY race_date ASC
        LIMIT 1
    """, (today,)).fetchone()
    race_date = race["race_date"] if race else None

    # 🔹 Rider del team tramite rider_teams
    riders = cur.execute("""
        SELECT r.zwift_power_id AS id, r.name, r.category
        FROM riders r
        JOIN rider_teams rt ON r.zwift_power_id = rt.zwift_power_id
        WHERE rt.team_id = ? AND r.active = 1
        ORDER BY r.name
    """, (team_id,)).fetchall()

    # 🔹 Rider già selezionati nella lineup per questa gara
    lineup_ids = []
    if race_date:
        lineup_ids = [
            row["zwift_power_id"]
            for row in cur.execute("""
                SELECT zwift_power_id
                FROM race_lineup
                WHERE team_id = ? AND race_date = ?
            """, (team_id, race_date)).fetchall()
        ]

    # 🔹 Capitano assegnato (nome)
    captain = cur.execute("""
        SELECT name
        FROM riders
        WHERE zwift_power_id = ?
    """, (session.get("zwift_id"),)).fetchone()
    captain_name = captain["name"] if captain else None

    # 🔹 Dati team
    team = cur.execute("SELECT name FROM teams WHERE id = ?", (team_id,)).fetchone()
    team_name = team["name"] if team else None

    conn.close()

    return render_template(
        "captain/captain_dashboard.html",
        team_assigned=True,
        race=race,
        race_date=race_date,
        riders=riders,
        lineup_ids=lineup_ids,
        captain_name=captain_name,
        team_name=team_name
    )
