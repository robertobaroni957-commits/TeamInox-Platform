from flask import Blueprint, render_template, request, redirect, url_for, flash
import sqlite3
from utils.auth_decorators import require_admin
from db import get_zrl_db

admin_teams_bp = Blueprint("admin_teams", __name__, url_prefix="/admin/teams")

# =========================
# Gestione Team
# =========================
@admin_teams_bp.route("/manage", methods=["GET", "POST"])
@require_admin
def manage_teams():
    conn = get_zrl_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    if request.method == "POST":
        action = request.form.get("action")
        team_id = request.form.get("team_id")

        name = request.form.get("name")
        category = request.form.get("category")
        division = request.form.get("division")
        division_number = request.form.get("division_number")
        league_id = request.form.get("league_id") or None
        captain_id = request.form.get("captain_id") or None

        if action == "create":
            cur.execute("""
                INSERT INTO teams (name, category, division, division_number, league_id, captain_zwift_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name, category, division, division_number, league_id, captain_id))
            conn.commit()
            flash("✅ Team creato!", "success")

        elif action == "update" and team_id:
            cur.execute("""
                UPDATE teams
                SET name=?, category=?, division=?, division_number=?, league_id=?, captain_zwift_id=?
                WHERE id=?
            """, (name, category, division, division_number, league_id, captain_id, team_id))
            conn.commit()
            flash("💾 Team aggiornato!", "success")

        elif action == "delete" and team_id:
            cur.execute("DELETE FROM teams WHERE id=?", (team_id,))
            conn.commit()
            flash("🗑️ Team eliminato", "warning")

        return redirect(url_for("admin_teams.manage_teams"))

    # --- GET ---
    teams = cur.execute("""
        SELECT t.*, r.zwift_power_id AS captain_zwift_id, r.name AS captain_name
        FROM teams t
        LEFT JOIN riders r ON t.captain_zwift_id = r.zwift_power_id
        ORDER BY t.name
    """).fetchall()

    leagues = cur.execute("SELECT id, name FROM leagues ORDER BY name").fetchall()
    captains = cur.execute("""
        SELECT zwift_power_id, name
        FROM riders
        WHERE is_captain = 1 AND active = 1 AND name IS NOT NULL AND name != ''
        ORDER BY name
    """).fetchall()

    conn.close()
    return render_template("admin/manage_teams.html", teams=teams, leagues=leagues, captains=captains)


# =========================================================
# Gestione Membri Team
# =========================================================
@admin_teams_bp.route("/members/<int:team_id>", methods=["GET", "POST"])
@require_admin
def manage_team_members(team_id):
    conn = get_zrl_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    team = cur.execute("SELECT * FROM teams WHERE id=?", (team_id,)).fetchone()
    if not team:
        conn.close()
        flash("❌ Team non trovato", "danger")
        return redirect(url_for("admin_teams.manage_teams"))

    category_order = ["D", "C", "B", "A"]
    team_cat = "A" if team["category"] == "A+" else team["category"]
    team_index = category_order.index(team_cat) if team_cat in category_order else 0

    if request.method == "POST":
        action = request.form.get("action")
        zwift_power_id = request.form.get("rider_id")
        captain_id = request.form.get("captain_id")

        # Aggiungi rider
        if action == "add_rider" and zwift_power_id:
            rider = cur.execute("""
                SELECT category, name FROM riders
                WHERE zwift_power_id=? AND active=1 AND name IS NOT NULL AND name != ''
            """, (zwift_power_id,)).fetchone()

            if rider:
                rider_cat = "A" if rider["category"] == "A+" else rider["category"]
                if rider_cat in category_order and category_order.index(rider_cat) <= team_index:
                    team_count = cur.execute("""
                        SELECT COUNT(*) FROM rider_teams WHERE zwift_power_id=?
                    """, (zwift_power_id,)).fetchone()[0]
                    if team_count < 2:
                        cur.execute("""
                            INSERT OR REPLACE INTO rider_teams (zwift_power_id, team_id)
                            VALUES (?, ?)
                        """, (zwift_power_id, team_id))
                        flash("✅ Rider aggiunto al team", "success")
                    else:
                        flash("⚠️ Rider già assegnato a 2 team", "warning")
                else:
                    flash("⚠️ Rider di categoria superiore: non può essere assegnato", "warning")
            else:
                flash("❌ Rider non trovato o non valido", "danger")

        # Rimuovi rider
        elif action == "remove_rider" and zwift_power_id:
            cur.execute("DELETE FROM rider_teams WHERE zwift_power_id=? AND team_id=?", (zwift_power_id, team_id))
            flash("🗑️ Rider rimosso", "warning")

        # Imposta capitano
        elif action == "set_captain":
            if captain_id:
                valid = cur.execute("""
                    SELECT zwift_power_id FROM riders
                    WHERE zwift_power_id=? AND active=1 AND is_captain=1
                """, (captain_id,)).fetchone()
                if valid:
                    cur.execute("UPDATE teams SET captain_zwift_id=? WHERE id=?", (captain_id, team_id))
                    flash("🧢 Capitano assegnato", "success")
                else:
                    flash("❌ Rider non valido", "danger")
            else:
                cur.execute("UPDATE teams SET captain_zwift_id=NULL WHERE id=?", (team_id,))
                flash("🧢 Capitano rimosso", "info")

        conn.commit()
        return redirect(url_for("admin_teams.manage_team_members", team_id=team_id))

    # --- GET: membri del team ---
    riders = cur.execute("""
        SELECT r.*
        FROM rider_teams rt
        JOIN riders r ON rt.zwift_power_id=r.zwift_power_id
        WHERE rt.team_id=? AND r.active=1 AND r.name IS NOT NULL AND r.name != ''
        ORDER BY r.name
    """, (team_id,)).fetchall()
    assigned_rider_ids = {r["zwift_power_id"] for r in riders}

    # Capitani candidati (solo membri già promossi)
    captain_candidates = [r for r in riders if r.get("is_captain") == 1]

    # Rider compatibili
    category_riders = cur.execute("""
        SELECT r.*
        FROM riders r
        WHERE r.active=1 AND r.name IS NOT NULL AND r.name != ''
        AND r.zwift_power_id NOT IN (
            SELECT zwift_power_id FROM rider_teams WHERE team_id=?
        )
        AND r.zwift_power_id NOT IN (
            SELECT zwift_power_id FROM rider_teams
            GROUP BY zwift_power_id
            HAVING COUNT(*) >= 2
        )
        ORDER BY r.name
    """, (team_id,)).fetchall()

    compatible_riders = []
    for r in category_riders:
        r_cat = "A" if r["category"] == "A+" else r["category"]
        if r_cat in category_order and category_order.index(r_cat) <= team_index:
            compatible_riders.append(r)

    conn.close()
    return render_template(
        "admin/manage_team_members.html",
        team=team,
        riders=riders,
        captain_candidates=captain_candidates,
        compatible_riders=compatible_riders,
        assigned_rider_ids=assigned_rider_ids
    )
