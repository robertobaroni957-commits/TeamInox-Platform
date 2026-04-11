# newZRL/models/user.py
from newZRL import db
from flask_login import UserMixin
from werkzeug.security import check_password_hash

class User(db.Model, UserMixin):
    __tablename__ = "users"

    zwift_power_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    active = db.Column(db.Boolean, default=True)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"))

    # 🔹 metodo per verificare password
    def check_password(self, raw_password):
        return check_password_hash(self.password, raw_password)

    # 🔹 Flask-Login user_id
    def get_id(self):
        return str(self.zwift_power_id)  # deve restituire una stringa
