import sqlite3
from functools import wraps
from flask import session, flash, redirect, url_for
from werkzeug.security import check_password_hash

DB_PATH = "zrl.db"

# ============================================================
# 🔌 Connessione al database
# ============================================================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ============================================================
# 🔐 Decoratori di accesso
# ============================================================

def require_role(*allowed_roles):
    """Permette l'accesso solo a determinati ruoli."""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            role = session.get("user_role")
            if role not in allowed_roles:
                flash("⛔ Accesso non autorizzato", "danger")
                return redirect(url_for("auth.login"))
            return f(*args, **kwargs)
        return wrapped
    return decorator

def require_admin(f):
    return require_role("admin")(f)

def require_moderator(f):
    # Permette sia admin che moderator
    return require_role("admin", "moderator")(f)

def require_captain(f):
    return require_role("captain")(f)


# ============================================================
# 🧑‍💼 Login e Logout utente
# ============================================================

def login_user(email, password):
    """Login utente e memorizzazione in sessione."""
    conn = get_db()
    cur = conn.cursor()
    user = cur.execute("""
        SELECT * FROM users
        WHERE email = ? AND active = 1
    """, (email,)).fetchone()
    conn.close()

    if user and check_password_hash(user["password"], password):
        # Salva dati in sessione
        session["user_id"] = user["zwift_power_id"]
        session["user_email"] = user["email"]
        session["user_role"] = user["role"]
        session["team_id"] = user["team_id"] if "team_id" in user.keys() else None
        return user
    return None

def logout_user():
    """Logout utente."""
    session.clear()


# ============================================================
# 🔐 Decoratori specifici aggiuntivi (opzionali)
# ============================================================

def require_roles(allowed_roles):
    """Permette accesso solo a ruoli multipli definiti in allowed_roles"""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            role = session.get("user_role")
            if role not in allowed_roles:
                flash("⛔ Accesso non autorizzato", "danger")
                return redirect(url_for("auth.login"))
            return f(*args, **kwargs)
        return wrapped
    return decorator
