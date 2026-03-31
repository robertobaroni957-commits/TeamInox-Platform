import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "zrl.db"

def get_all_teams():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Recupera tutte le squadre con info capitano e conteggio rider nella lineup
    query = """
    SELECT
        t.id,
        t.name,
        t.category,
        t.division,
        t.division_number,
        t.league_id,
        t.captain_id,
        r.name AS captain_name,
        -- Conteggio rider assegnati a questa squadra nelle lineup
        (SELECT COUNT(*) 
         FROM race_lineup rl 
         WHERE rl.team_id = t.id) AS rider_count,
        -- Indica se la squadra ha almeno una lineup
        CASE WHEN EXISTS (
            SELECT 1 FROM race_lineup rl WHERE rl.team_id = t.id
        ) THEN 1 ELSE 0 END AS has_lineup
    FROM teams t
    LEFT JOIN riders r ON r.zwift_power_id = t.captain_id
    ORDER BY t.category, t.division, t.name
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    # Trasforma in lista di dizionari
    teams = []
    for row in rows:
        teams.append({
            "id": row["id"],
            "name": row["name"],
            "category": row["category"],
            "division": row["division"],
            "division_number": row["division_number"],
            "league_id": row["league_id"],
            "captain_id": row["captain_id"],
            "captain_name": row["captain_name"],
            "rider_count": row["rider_count"],
            "has_lineup": bool(row["has_lineup"]),
            "empty": False  # utile per il template se vuoi mostrare card vuote
        })

    return teams
