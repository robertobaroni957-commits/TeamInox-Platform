from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import get_zrl_db
from utils.auth_decorators import require_admin

admin_teams_bp = Blueprint("admin_teams", __name__)

@admin_teams_bp.route("/manage_teams", methods=["GET", "POST"])
@require_admin
def manage_teams():
    conn = get_zrl_db()
    conn.row_factory = lambda cursor, row: {col[0]: row[idx] for idx, col in enumerate(cursor.description)}
    cur = conn.cursor()

    if request.method == "POST":
        action = request.form.get("action")
        team_id = request.form.get("team_id")

        if action == "create":
            name = request.form["name"].strip()
            category = request.form["category"]
            division = request.form["division"]
            division_number = request.form.get("division_number")
            league_id = request.form.get("league_id") or None
            captain_id = request.form.get("captain_id") or None

            cur.execute("""
                INSERT INTO teams (name, category, division, division_number, league_id, captain_zwift_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name, category, division, division_number, league_id, captain_id))
            conn.commit()
            flash("✅ Team creato con successo!", "success")

        elif action == "update" and team_id:
            name = request.form["name"].strip()
            category = request.form["category"]
            division = request.form["division"]
            division_number = request.form.get("division_number")
            league_id = request.form.get("league_id") or None
            captain_id = request.form.get("captain_id") or None

            cur.execute("""
                UPDATE teams
                SET name=?, category=?, division=?, division_number=?, league_id=?, captain_zwift_id=?
                WHERE id=?
            """, (name, category, division, division_number, league_id, captain_id, team_id))
            conn.commit()
            flash("💾 Team aggiornato con successo!", "success")

        elif action == "delete" and team_id:
            # prima cancella i rider associati
            cur.execute("DELETE FROM rider_teams WHERE team_id = ?", (team_id,))
            # poi elimina il team
            cur.execute("DELETE FROM teams WHERE id = ?", (team_id,))
            # eventualmente cancella anche il capitano associato
            cur.execute("DELETE FROM captains WHERE team_id = ?", (team_id,))
            conn.commit()
            flash("🗑️ Team e membri eliminati correttamente.", "warning")

        return redirect(url_for("admin_teams.manage_teams"))

    # GET: dati per la vista
    teams = cur.execute("""
        SELECT t.*, r.name AS captain_name
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







@admin_teams_bp.route("/members/<int:team_id>", methods=["GET", "POST"])
@require_admin
def manage_team_members(team_id):
    conn = get_zrl_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    team = cur.execute("SELECT * FROM teams WHERE id = ?", (team_id,)).fetchone()
    if not team:
        conn.close()
        flash("❌ Team non trovato", "danger")
        return redirect(url_for("admin_teams.manage_teams"))

    category_order = ["D", "C", "B", "A"]
    team_cat = "A" if team["category"] == "A+" else team["category"]
    if team_cat not in category_order:
        flash("❌ Categoria team non valida", "danger")
        return redirect(url_for("admin_teams.manage_teams"))
    team_index = category_order.index(team_cat)

    if request.method == "POST":
        action = request.form.get("action")
        zwift_power_id = request.form.get("rider_id")
        captain_id = request.form.get("captain_id")

        if action == "add_rider" and zwift_power_id:
            rider = cur.execute("SELECT category FROM riders WHERE zwift_power_id = ? AND active = 1", (zwift_power_id,)).fetchone()
            if not rider:
                flash("❌ Rider non trovato o non attivo", "danger")
            else:
                rider_cat = "A" if rider["category"] == "A+" else rider["category"]
                if rider_cat not in category_order:
                    flash("❌ Categoria rider non valida", "danger")
                else:
                    rider_index = category_order.index(rider_cat)
                    if rider_index <= team_index:
                        team_count = cur.execute("""
                            SELECT COUNT(*) FROM rider_teams WHERE zwift_power_id = ?
                        """, (zwift_power_id,)).fetchone()[0]
                        if team_count >= 2:
                            flash("⚠️ Rider già assegnato a 2 team", "warning")
                        else:
                            # Inserisce (o aggiorna) l’associazione nella tabella rider_teams
                            cur.execute("""
                                INSERT OR REPLACE INTO rider_teams (zwift_power_id, team_id)
                                VALUES (?, ?)
                            """, (zwift_power_id, team_id))

                        flash("✅ Rider aggiunto al team", "success")

                    else:
                        flash("⚠️ Rider di categoria superiore: non può essere assegnato", "warning")

        elif action == "remove_rider" and zwift_power_id:
            cur.execute("DELETE FROM rider_teams WHERE zwift_power_id = ? AND team_id = ?", (zwift_power_id, team_id))
            cur.execute("UPDATE riders SET is_captain = 0 WHERE zwift_power_id = ?", (zwift_power_id,))
            flash("🗑️ Rider rimosso", "warning")

        elif action == "set_captain":
            cur.execute("""
                UPDATE riders SET is_captain = 0
                WHERE zwift_power_id IN (
                    SELECT zwift_power_id FROM rider_teams WHERE team_id = ?
                )
            """, (team_id,))
            # Se c'è un capitano selezionato, aggiorna la tabella captains
        if captain_id:
            # Prendi il nome del capitano dalla tabella riders
            captain_row = cur.execute("""
                SELECT name FROM riders WHERE zwift_power_id = ?
            """, (captain_id,)).fetchone()
            captain_name = captain_row["name"] if captain_row else None

            # Controlla se esiste già un record per questo team
            existing = cur.execute("""
                SELECT 1 FROM captains WHERE team_id = ?
            """, (team_id,)).fetchone()

            if existing:
                # Aggiorna record esistente
                cur.execute("""
                    UPDATE captains
                    SET zwift_power_id = ?, name = ?, active = 1
                    WHERE team_id = ?
                """, (captain_id, captain_name, team_id))
            else:
                # Inserisci nuovo record
                cur.execute("""
                    INSERT INTO captains (team_id, zwift_power_id, name, active)
                    VALUES (?, ?, ?, 1)
                """, (team_id, captain_id, captain_name))
            conn.commit()


        return redirect(url_for("admin_teams.manage_team_members", team_id=team_id))

    # GET logic
    riders = cur.execute("""
        SELECT r.*
        FROM rider_teams rt
        JOIN riders r ON rt.zwift_power_id = r.zwift_power_id
        WHERE rt.team_id = ? AND r.active = 1
        ORDER BY r.name
    """, (team_id,)).fetchall()
    assigned_rider_ids = {r["zwift_power_id"] for r in riders}

    captain = cur.execute("""
        SELECT r.*
        FROM teams t
        JOIN riders r ON t.captain_zwift_id = r.zwift_power_id
        WHERE t.id = ? AND r.active = 1
    """, (team_id,)).fetchone()

    captain_candidates = riders

    category_riders = cur.execute("""
        SELECT r.*
        FROM riders r
        WHERE r.active = 1
        AND r.zwift_power_id NOT IN (
            SELECT zwift_power_id
            FROM rider_teams
            GROUP BY zwift_power_id
            HAVING COUNT(*) >= 2
        )
        AND r.zwift_power_id NOT IN (
            SELECT zwift_power_id
            FROM rider_teams
            WHERE team_id = ?
        )
        ORDER BY r.name
    """, (team_id,)).fetchall()

    compatible_riders = []
    for r in category_riders:
        r_cat = r["category"]
        if r_cat:
            r_cat = "A" if r_cat == "A+" else r_cat
            if r_cat in category_order:
                rider_index = category_order.index(r_cat)
                if rider_index <= team_index:
                    compatible_riders.append(r)

    conn.close()
    return render_template("admin/manage_team_members.html",
                           team=team,
                           riders=riders,
                           captain=captain,
                           captain_candidates=captain_candidates,
                           category_riders=compatible_riders,
                           assigned_rider_ids=assigned_rider_ids)