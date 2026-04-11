from newZRL import db

class Race(db.Model):
    __tablename__ = "races"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    race_date = db.Column(db.Date)
    format = db.Column(db.String(50))
    world = db.Column(db.String(50))
    course = db.Column(db.String(50))
    laps = db.Column(db.Integer)
    distance_km = db.Column(db.Float)
    elevation_m = db.Column(db.Float)
    powerups = db.Column(db.String(255))
    fal_segments = db.Column(db.String(255))
    fts_segments = db.Column(db.String(255))
    active = db.Column(db.Boolean)
    round_id = db.Column(db.Integer, db.ForeignKey("rounds.id"))
    external_id = db.Column(db.String(255))
