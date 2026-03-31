from flask import Blueprint, render_template, request, redirect, url_for, flash
from utils.auth_decorators import login_user, logout_user



auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# ============================================================
# 🔑 LOGIN (Admin, Moderator, Captain)
# ============================================================
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        if not email or not password:
            flash("⚠️ Compila tutti i campi", "warning")
            return redirect(url_for("auth.login"))

        user = login_user(email, password)
        if not user:
            flash("❌ Credenziali non valide o utente inattivo", "danger")
            return redirect(url_for("auth.login"))

        role = user["role"]
        flash(f"✅ Accesso effettuato come {role}", "success")

        # Reindirizza in base al ruolo
        if role == "admin":
            return redirect(url_for("admin_panel.admin_dashboard"))
        elif role == "moderator":
            return redirect(url_for("moderator.dashboard"))

        elif role == "captain":
            return redirect(url_for("captain_panel.captain_dashboard"))
        else:
            flash("⚠️ Ruolo non riconosciuto", "warning")
            return redirect(url_for("auth.login"))

    return render_template("auth/login.html")


# ============================================================
# 🔓 LOGOUT
# ============================================================
@auth_bp.route("/logout")
def logout():
    logout_user()
    flash("👋 Logout effettuato con successo", "info")
    return redirect(url_for("auth.login"))


# ============================================================
# 🔁 RECUPERO PASSWORD (placeholder)
# ============================================================
@auth_bp.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    # Da implementare
    return render_template("auth/forgot_password.html")
