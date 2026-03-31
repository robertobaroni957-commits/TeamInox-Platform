import sqlite3
from flask import Blueprint, render_template, request, redirect, url_for, flash
from db import get_db
from utils.auth_decorators import require_admin
from werkzeug.security import generate_password_hash

# Blueprint
admin_manage_users = Blueprint(
    "admin_manage_users",
    __name__,
    template_folder="../../../templates/admin"
)

# ==========================
# Lista utenti
# ==========================
@admin_manage_users.route("/admin/users")
@require_admin
def list_users():
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    users = cur.execute(
        "SELECT zwift_power_id, email, role, team_id, active FROM users ORDER BY email"
    ).fetchall()
    conn.close()
    return render_template("list_users.html", users=users)

# ==========================
# Visualizza utente
# ==========================
@admin_manage_users.route("/admin/users/<int:zwift_power_id>")
@require_admin
def show_user(zwift_power_id):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    user = cur.execute(
        "SELECT zwift_power_id, email, role, team_id, active FROM users WHERE zwift_power_id = ?",
        (zwift_power_id,)
    ).fetchone()
    conn.close()

    if not user:
        return "Utente non trovato", 404

    return render_template("show_user.html", user=user)

# ==========================
# Modifica utente
# ==========================
@admin_manage_users.route("/admin/users/<int:zwift_power_id>/edit", methods=["GET", "POST"])
@require_admin
def edit_user(zwift_power_id):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Recupero dati utente
    user = cur.execute(
        "SELECT zwift_power_id, email, role, team_id, active FROM users WHERE zwift_power_id = ?",
        (zwift_power_id,)
    ).fetchone()

    if not user:
        conn.close()
        return "Utente non trovato", 404

    if request.method == "POST":
        email = request.form.get("email")
        role = request.form.get("role").lower().capitalize()  # normalizza il ruolo
        team_id = request.form.get("team_id")
        active = 1 if request.form.get("active") == "1" else 0

        # Controllo che il ruolo sia valido
        if role not in ("Admin", "Moderator", "Captain"):
            flash("❌ Ruolo non valido", "danger")
            conn.close()
            return redirect(url_for("admin_manage_users.edit_user", zwift_power_id=zwift_power_id))

        # Salva nel DB
        cur.execute(
            """
            UPDATE users
            SET email = ?, role = ?, team_id = ?, active = ?
            WHERE zwift_power_id = ?
            """,
            (email, role.lower(), team_id, active, zwift_power_id)
        )
        conn.commit()
        flash("✅ Utente aggiornato con successo", "success")
        conn.close()
        return redirect(url_for("admin_manage_users.list_users"))

    conn.close()
    return render_template("edit_user.html", user=user)

# ==========================
# Elimina utente
# ==========================
@admin_manage_users.route("/admin/users/<int:zwift_power_id>/delete", methods=["POST"])
@require_admin
def delete_user(zwift_power_id):
    conn = get_db()
    cur = conn.cursor()

    user = cur.execute(
        "SELECT zwift_power_id, email FROM users WHERE zwift_power_id = ?",
        (zwift_power_id,)
    ).fetchone()
    if not user:
        conn.close()
        flash("❌ Utente non trovato", "danger")
        return redirect(url_for("admin_manage_users.list_users"))

    cur.execute("DELETE FROM users WHERE zwift_power_id = ?", (zwift_power_id,))
    conn.commit()
    conn.close()
    flash(f"🗑️ Utente {user['email']} eliminato con successo", "success")
    return redirect(url_for("admin_manage_users.list_users"))

# ==========================
# Disattiva Utente
# ==========================
@admin_manage_users.route("/admin/users/<int:zwift_power_id>/deactivate", methods=["POST"])
@require_admin
def deactivate_user(zwift_power_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET active = 0 WHERE zwift_power_id = ?", (zwift_power_id,))
    conn.commit()
    conn.close()
    flash("⛔ Utente disattivato con successo", "info")
    return redirect(url_for("admin_manage_users.list_users"))

# ==========================
# Crea nuovo utente
# ==========================
@admin_manage_users.route("/admin/users/new", methods=["GET", "POST"])
@require_admin
def create_user():
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Recupera tutti i team per la dropdown
    teams = cur.execute("SELECT id, name FROM teams ORDER BY name").fetchall()

    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        password = request.form.get("password")
        zwift_power_id = request.form.get("zwift_power_id")
        role = request.form.get("role").lower()
        team_id = request.form.get("team_id") or None
        active = 1 if request.form.get("active") == "1" else 0

        # Validazioni
        if not name or not email or not password or not zwift_power_id:
            flash("❌ Tutti i campi obbligatori devono essere compilati", "danger")
            return redirect(url_for("admin_manage_users.create_user"))

        if role not in ("admin", "captain", "rider"):
            flash("❌ Ruolo non valido", "danger")
            return redirect(url_for("admin_manage_users.create_user"))

        # Controllo email già esistente
        existing = cur.execute("SELECT email FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            flash("⚠️ Esiste già un utente con questa email", "warning")
            return redirect(url_for("admin_manage_users.create_user"))

        # Hash password
        hashed_pw = generate_password_hash(password)

        # Inserimento utente
        cur.execute("""
            INSERT INTO users (zwift_power_id, name, email, password, role, team_id, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (zwift_power_id, name, email, hashed_pw, role, team_id, active))

        # Aggiorna anche la tabella riders se il ruolo è captain
        if role == "captain":
            cur.execute("""
                INSERT OR REPLACE INTO riders (zwift_power_id, name, team_id, is_captain, active)
                VALUES (?, ?, ?, 1, 1)
            """, (zwift_power_id, name, team_id))

        conn.commit()
        flash("✅ Nuovo utente creato con successo", "success")
        return redirect(url_for("admin_manage_users.list_users"))

    conn.close()
    return render_template("new_user.html", teams=teams)


# ==========================
# Riattiva Utente
# ==========================
@admin_manage_users.route("/admin/users/<int:zwift_power_id>/activate", methods=["POST"])
@require_admin
def activate_user(zwift_power_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET active = 1 WHERE zwift_power_id = ?", (zwift_power_id,))
    conn.commit()
    conn.close()
    flash("✅ Utente riattivato con successo", "success")
    return redirect(url_for("admin_manage_users.list_users"))
