from newZRL import db

class Rider(db.Model):
    __tablename__ = "riders"

    zwift_power_id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(255))
    category = db.Column(db.String(10))
    ranking = db.Column(db.Float)
    wkg_20min = db.Column(db.Float)
    watt_20min = db.Column(db.Float)
    wkg_15sec = db.Column(db.Float)
    watt_15sec = db.Column(db.Float)
    status = db.Column(db.String(50))
    races = db.Column(db.Integer)
    weight = db.Column(db.Float)
    ftp = db.Column(db.Float)
    age = db.Column(db.Integer)
    available_zrl = db.Column(db.Boolean)
    is_captain = db.Column(db.Boolean)
    email = db.Column(db.String(255))
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean)
    profile_url = db.Column(db.String(255))
    created_at = db.Column(db.String(50))
    country = db.Column(db.String(50))
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"))

    # ⚡ Usa stringa "RiderTeam" per evitare problemi di circular import
    rider_teams = db.relationship("RiderTeam", back_populates="rider")

    def __repr__(self):
        return f"<Rider {self.name} ({self.zwift_power_id})>"
