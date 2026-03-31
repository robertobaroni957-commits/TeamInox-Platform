from flask import Blueprint, render_template, session
from db import get_db
import sqlite3

captain_panel = Blueprint("captain_panel", __name__, url_prefix="/captain")

@captain_panel.route("/dashboard", endpoint="captain_dashboard")
def captain_dashboard():
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Verifica se il capitano ha un team assegnato
    team_id = session.get("team_id")
    team_assigned = team_id is not None

    # Recupera la prossima gara
    race = cur.execute("""
        SELECT id, name, race_date
        FROM races
        WHERE race_date >= date('now')
        ORDER BY race_date ASC
        LIMIT 1
    """).fetchone()

    race_id = race["id"] if race else None
    race_date = race["race_date"] if race else None

    # Recupera rider disponibili per il team tramite rider_teams
    riders = []
    if team_assigned:
        riders = cur.execute("""
            SELECT r.zwift_power_id AS id, r.name, r.category
            FROM riders r
            JOIN rider_teams rt ON r.zwift_power_id = rt.zwift_power_id
            WHERE rt.team_id = ? AND r.active = 1
            ORDER BY r.name
        """, (team_id,)).fetchall()

    # Recupera rider già selezionati per la formazione (lineup)
    lineup_ids = []
    if team_assigned and race_id:
        lineup_ids = []
        if team_assigned and race_date:
            lineup_ids = [
                row["zwift_power_id"]
                for row in cur.execute("""
                    SELECT zwift_power_id
                    FROM race_lineup
                    WHERE team_id = ? AND race_date = ?
                """, (team_id, race_date)).fetchall()
            ]


    conn.close()

    return render_template(
        "captain/captain_dashboard.html",
        team_assigned=team_assigned,
        race=race,
        race_date=race_date,
        riders=riders,
        lineup_ids=lineup_ids
    )
