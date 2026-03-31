import sqlite3
from flask import Blueprint, render_template, request, flash, redirect, url_for
from utils.auth_decorators import require_role, get_db, generate_password_hash

# Blueprint
moderator_import_riders = Blueprint(
    "moderator_import_riders",
    __name__,
    template_folder="../../../templates/moderator"
)

# Decoratore per moderatori
require_moderator = require_role("moderator", "admin")

# ==========================
# Lista e importazione rider
# ==========================
@moderator_import_riders.route("/moderator/riders", methods=["GET", "POST"])
@require_moderator
def import_riders():
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Recupera filtro categoria
    selected_category = request.args.get("category", "")

    query = "SELECT * FROM zwift_riders"
    params = []

    if selected_category:
        query += " WHERE category = ?"
        params.append(selected_category)

    zwift_riders = cur.execute(query, params).fetchall()

    if request.method == "POST":
        # Importazione dei rider selezionati
        rider_ids = request.form.getlist("rider_ids")
        if not rider_ids:
            flash("⚠️ Nessun rider selezionato", "warning")
            return redirect(url_for("moderator_import_riders.import_riders"))

        imported = 0
        for zwift_id in rider_ids:
            # Controllo se esiste già
            exists = cur.execute(
                "SELECT 1 FROM users WHERE zwift_power_id = ?", (zwift_id,)
            ).fetchone()
            if exists:
                continue

            # Recupera dati rider
            rider = cur.execute(
                "SELECT * FROM zwift_riders WHERE zwift_power_id = ?", (zwift_id,)
            ).fetchone()

            if not rider:
                continue

            # Inserisce come utente
            cur.execute(
                """
                INSERT INTO users (zwift_power_id, email, password, role, team_id, active)
                VALUES (?, ?, ?, ?, ?, 1)
                """,
                (
                    rider["zwift_power_id"],
                    f"{rider['zwift_power_id']}@zrl.local",
                    generate_password_hash("default123"),  # password iniziale
                    "captain" if rider.get("is_captain") else "rider",
                    rider.get("team_id")
                )
            )
            imported += 1

        conn.commit()
        flash(f"✅ Importati {imported} rider", "success")
        return redirect(url_for("moderator_import_riders.import_riders"))

    conn.close()
    return render_template(
        "moderator_import_riders.html",
        zwift_riders=zwift_riders,
        selected_category=selected_category
    )
