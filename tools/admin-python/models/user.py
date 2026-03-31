import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "zrl.db"

class User:
    def __init__(self, id, email, password, role, active=1, zwift_power_id=None):
        self.id = id
        self.email = email
        self.password = password
        self.role = role
        self.active = active
        self.zwift_power_id = zwift_power_id

    @staticmethod
    def get_connection():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @classmethod
    def all(cls):
        conn = cls.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY id")
        rows = cursor.fetchall()
        conn.close()
        return [cls(**row) for row in map(dict, rows)]

    @classmethod
    def get_by_id(cls, user_id):
        conn = cls.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return cls(**dict(row)) if row else None

    @classmethod
    def create(cls, email, password, role, active=1, zwift_power_id=None):
        conn = cls.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, password, role, active, zwift_power_id) VALUES (?, ?, ?, ?, ?)",
            (email, password, role, active, zwift_power_id)
        )
        conn.commit()
        conn.close()
