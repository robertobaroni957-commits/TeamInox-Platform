import sqlite3
import pandas as pd
import shutil
from datetime import datetime
from pathlib import Path

# --- Percorsi ---
db_path = Path("zrl.db")
whitelist_path = Path("data/whitelist.csv")

# --- Backup automatico ---
backup_path = db_path.parent / f"zrl_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
shutil.copy(db_path, backup_path)
print(f"✅ Backup creato: {backup_path}")

# --- Carica whitelist come lista ---
try:
    whitelist = pd.read_csv(whitelist_path, header=None)[0].astype(str).str.strip().tolist()
    whitelist = [x for x in whitelist if x]  # Rimuove eventuali stringhe vuote
except Exception as e:
    print(f"❌ Errore nel caricamento della whitelist: {e}")
    exit(1)

print(f"📄 Whitelist caricata ({len(whitelist)} ID).")

# --- Connessione al database ---
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# --- Conta riders prima ---
cur.execute("SELECT COUNT(*) FROM riders;")
count_before = cur.fetchone()[0]
print(f"👥 Riders totali prima: {count_before}")

# --- Cancella riders non in whitelist ---
if whitelist:
    placeholders = ",".join(["?"] * len(whitelist))
    query = f"DELETE FROM riders WHERE zwift_power_id NOT IN ({placeholders});"
    cur.execute(query, tuple(whitelist))
    conn.commit()
    print("🧹 Pulizia eseguita.")
else:
    print("⚠️ Whitelist vuota. Nessuna cancellazione eseguita.")

# --- Conta riders dopo ---
cur.execute("SELECT COUNT(*) FROM riders;")
count_after = cur.fetchone()[0]
conn.close()

# --- Report finale ---
print(f"✅ Pulizia completata.")
print(f"👥 Riders rimasti: {count_after}")
print(f"🗑️ Rimossi: {count_before - count_after}")