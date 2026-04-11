from flask import Blueprint, render_template, request, redirect, url_for, flash, session
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

        # Imposta la sessione per la sidebar
        session["user_id"] = user.zwift_power_id   # <-- era user.id
        session["user_role"] = user.role
        session["user_email"] = user.email


        flash(f"✅ Accesso effettuato come {user.role}", "success")

        # Reindirizza in base al ruolo
        if user.role == "admin":
            return redirect(url_for("admin.dashboard"))
        elif user.role == "moderator":
            return redirect(url_for("moderator.dashboard"))
        elif user.role == "captain":
            return redirect(url_for("captain.dashboard"))
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
    session.clear()  # ✅ svuota completamente la sessione
    flash("👋 Logout effettuato con successo", "info")
    return redirect(url_for("auth.login"))



# ============================================================
# 🔁 RECUPERO PASSWORD (placeholder)
# ============================================================
@auth_bp.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    # Da implementare
    return render_template("auth/forgot_password.html")
