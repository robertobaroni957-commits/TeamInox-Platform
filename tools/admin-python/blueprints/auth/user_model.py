import sqlite3
from flask_login import UserMixin
from db import get_db  # supponendo tu abbia questa funzione

class User(UserMixin):
    def __init__(self, id, email, role, active=True):
        self.id = id
        self.email = email
        self.role = role
        self.active = active

    def is_active(self):
        return self.active

def get_user_by_id(user_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, email, role, active FROM users WHERE id=?", (user_id,))
    row = cur.fetchone()
    if row:
        return User(*row)
    return None

def get_user_by_email(email):
    db = get_db()
    cur = db.cursor()
    # Cambio password in password_hash per allinearmi al nuovo schema D1
    cur.execute("SELECT id, email, role, active, password_hash FROM users WHERE email=?", (email,))
    row = cur.fetchone()
    if row:
        id, email, role, active, password_hash = row
        return User(id, email, role, active), password_hash
    return None, None
