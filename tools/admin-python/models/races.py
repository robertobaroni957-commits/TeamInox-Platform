# models/races.py
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "zrl.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ============================================================
# 🔹 Recupera tutte le gare di un round
# ============================================================
def get_races_by_round(round_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT *
        FROM races
        WHERE round_id = ?
        ORDER BY race_date ASC
    """, (round_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ============================================================
# 🔹 Recupera una singola gara (opzionale)
# ============================================================
def get_race_by_id(race_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM races WHERE id = ?", (race_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# ============================================================
# 🔹 Recupera tutte le gare (opzionale)
# ============================================================
def get_all_races():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM races ORDER BY race_date ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
