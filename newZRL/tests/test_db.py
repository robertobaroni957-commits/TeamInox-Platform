import sys
import os
from sqlalchemy import text

# Aggiunge la cartella root del progetto al PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from newZRL import create_app
from newZRL.models import db

def test_db_connection():
    """Verifica connessione al database e presenza tabelle principali"""
    app = create_app()
    with app.app_context():
        try:
            # Test connessione base
            db.session.execute(text("SELECT 1"))
            print("✅ Connessione MySQL riuscita")

            # Controlla che le tabelle principali esistano
            tables = db.session.execute(text("SHOW TABLES")).fetchall()
            table_names = [t[0] for t in tables]
            print("📋 Tabelle trovate:", ", ".join(table_names))

            expected = [
                "users", "teams", "seasons", "rounds", "riders",
                "rider_teams", "races", "race_lineup", "leagues",
                "captains", "availability"
            ]
            missing = [t for t in expected if t not in table_names]
            if missing:
                print(f"⚠️ Tabelle mancanti: {', '.join(missing)}")
            else:
                print("✅ Tutte le tabelle principali sono presenti")

        except Exception as e:
            print("❌ Errore connessione o query DB:", e)

if __name__ == "__main__":
    test_db_connection()
