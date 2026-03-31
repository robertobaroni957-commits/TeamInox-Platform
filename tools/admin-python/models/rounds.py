# models/rounds.py
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "zrl.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ============================================================
# 🔹 Ottieni il round attivo
# ============================================================
def get_current_round():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT *
        FROM rounds
        WHERE is_active = 1
        ORDER BY id DESC
        LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# ============================================================
# 🔹 Recupera tutti i round (opzionale)
# ============================================================
def get_all_rounds():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rounds ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
