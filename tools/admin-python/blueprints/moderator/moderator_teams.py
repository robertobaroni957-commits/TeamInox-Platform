from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from utils.auth_decorators import require_moderator
from db import get_zrl_db
import sqlite3

moderator_teams_bp = Blueprint(
    "moderator_teams",
    __name__,
    url_prefix="/moderator/teams",
    template_folder="../../templates/moderator"
)

# ==========================
# 🚴 Gestione Team
# ==========================
@moderator_teams_bp.route("/", methods=["GET", "POST"])
@require_moderator
def manage_teams():
    role = session.get("user_role")  # "admin" o "moderator"

    conn = get_zrl_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    if request.method == "POST":
        action = request.form.get("action")
        team_id = request.form.get("team_id")
        captain_id = request.form.get("captain_id") or None

        if role == "admin":
            # Admin può modificare tutti i campi
            name = request.form.get("name")
            category = request.form.get("category")
            division = request.form.get("division")
            division_number = request.form.get("division_number")
            league_id = request.form.get("league_id") or None

            if action == "create":
                cur.execute("""
                    INSERT INTO teams (name, category, division, division_number, league_id, captain_zwift_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (name, category, division, division_number, league_id, captain_id))
                flash("✅ Team creato", "success")

            elif action == "update":
                cur.execute("""
                    UPDATE teams
                    SET name=?, category=?, division=?, division_number=?, league_id=?, captain_zwift_id=?
                    WHERE id=?
                """, (name, category, division, division_number, league_id, captain_id, team_id))
                flash("💾 Team aggiornato", "success")

            elif action == "delete":
                cur.execute("DELETE FROM teams WHERE id=?", (team_id,))
                flash("🗑️ Team eliminato", "warning")

        else:  # moderatore
            # Moderatore può aggiornare solo il capitano
            if action == "update":
                cur.execute("UPDATE teams SET captain_zwift_id=? WHERE id=?", (captain_id, team_id))
                flash("💾 Capitano aggiornato", "success")
            else:
                flash("⚠️ Azione non permessa per il tuo ruolo", "warning")

        conn.commit()
        conn.close()
        return redirect(url_for("moderator_teams.manage_teams"))

    # GET: recupero dati
    teams = cur.execute("""
        SELECT t.*, r.name AS captain_name, l.name AS league_name
        FROM teams t
        LEFT JOIN riders r ON t.captain_zwift_id = r.zwift_power_id
        LEFT JOIN leagues l ON t.league_id = l.id
        ORDER BY t.name
    """).fetchall()

    captains = cur.execute("""
        SELECT zwift_power_id, name
        FROM riders
        WHERE active=1 AND is_captain=1
        ORDER BY name
    """).fetchall()

    leagues = cur.execute("SELECT id, name FROM leagues ORDER BY name").fetchall()
    conn.close()

    return render_template(
        "moderator/manage_teams.html",
        teams=teams,
        captains=captains,
        leagues=leagues,
        role=role
    )

# ==========================
# 👥 Gestione Membri Team
# ==========================
@moderator_teams_bp.route("/members/<int:team_id>", methods=["GET", "POST"])
@require_moderator
def manage_team_members(team_id):
    role = session.get("user_role")
    conn = get_zrl_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    team = cur.execute("SELECT * FROM teams WHERE id=?", (team_id,)).fetchone()
    if not team:
        conn.close()
        flash("❌ Team non trovato", "danger")
        return redirect(url_for("moderator_teams.manage_teams"))

    category_order = ["D", "C", "B", "A"]
    team_cat = "A" if team["category"] == "A+" else team["category"]
    team_index = category_order.index(team_cat) if team_cat in category_order else 0

    if request.method == "POST":
        action = request.form.get("action")
        zwift_power_id = request.form.get("rider_id")
        captain_id = request.form.get("captain_id")

        # Aggiungi rider
        if action == "add_rider" and zwift_power_id:
            rider = cur.execute("SELECT category FROM riders WHERE zwift_power_id=? AND active=1", (zwift_power_id,)).fetchone()
            if rider:
                rider_cat = "A" if rider["category"] == "A+" else rider["category"]
                rider_index = category_order.index(rider_cat) if rider_cat in category_order else 10
                if rider_index <= team_index:
                    count = cur.execute("SELECT COUNT(*) FROM rider_teams WHERE zwift_power_id=?", (zwift_power_id,)).fetchone()[0]
                    if count < 2:
                        cur.execute("INSERT OR REPLACE INTO rider_teams (zwift_power_id, team_id) VALUES (?, ?)", (zwift_power_id, team_id))
                        flash("✅ Rider aggiunto al team", "success")
                    else:
                        flash("⚠️ Rider già assegnato a 2 team", "warning")
                else:
                    flash("⚠️ Rider di categoria superiore: non può essere assegnato", "warning")
            else:
                flash("❌ Rider non trovato o non attivo", "danger")

        # Rimuovi rider
        elif action == "remove_rider" and zwift_power_id:
            cur.execute("DELETE FROM rider_teams WHERE zwift_power_id=? AND team_id=?", (zwift_power_id, team_id))
            cur.execute("UPDATE riders SET is_captain=0 WHERE zwift_power_id=?", (zwift_power_id,))
            flash("🗑️ Rider rimosso", "warning")

        # Imposta capitano
        elif action == "set_captain":
            cur.execute("UPDATE riders SET is_captain=0 WHERE zwift_power_id IN (SELECT zwift_power_id FROM rider_teams WHERE team_id=?)", (team_id,))
            if captain_id:
                exists = cur.execute("SELECT zwift_power_id FROM riders WHERE zwift_power_id=? AND active=1", (captain_id,)).fetchone()
                if exists:
                    cur.execute("UPDATE riders SET is_captain=1 WHERE zwift_power_id=?", (captain_id,))
                    cur.execute("UPDATE teams SET captain_zwift_id=? WHERE id=?", (captain_id, team_id))
                    flash("🧢 Capitano assegnato", "success")
                else:
                    flash("❌ Rider non trovato o non attivo", "danger")
            else:
                cur.execute("UPDATE teams SET captain_zwift_id=NULL WHERE id=?", (team_id,))
                flash("🧢 Capitano rimosso", "info")

        conn.commit()
        return redirect(url_for("moderator_teams.manage_team_members", team_id=team_id))

    # GET
    riders = cur.execute("""
        SELECT r.*
        FROM rider_teams rt
        JOIN riders r ON rt.zwift_power_id=r.zwift_power_id
        WHERE rt.team_id=? AND r.active=1
        ORDER BY r.name
    """, (team_id,)).fetchall()

    assigned_rider_ids = {r["zwift_power_id"] for r in riders}
    captain = cur.execute("SELECT * FROM riders WHERE zwift_power_id=?", (team["captain_zwift_id"],)).fetchone()
    category_riders = cur.execute("""
        SELECT r.*
        FROM riders r
        WHERE r.active=1 AND r.zwift_power_id NOT IN (
            SELECT zwift_power_id FROM rider_teams WHERE team_id=?
        )
        ORDER BY r.name
    """, (team_id,)).fetchall()

    conn.close()
    return render_template(
        "moderator/manage_team_members.html",
        team=team,
        riders=riders,
        captain=captain,
        category_riders=category_riders,
        assigned_rider_ids=assigned_rider_ids,
        role=role
    )
