from newZRL import db

class Round(db.Model):
    __tablename__ = "rounds"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    season_id = db.Column(db.Integer, nullable=False)
    round_number = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, nullable=False)
    start_date = db.Column(db.String)  # testo come nel db originale
    end_date = db.Column(db.String)    # testo come nel db originale
    is_active = db.Column(db.Integer, default=1)  # 1 attivo, 0 inattivo
