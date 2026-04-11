from newZRL import db

class RaceLineup(db.Model):
    __tablename__ = "race_lineup"

    id = db.Column(db.Integer, primary_key=True)
    race_date = db.Column(db.String(50))
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"))
    zwift_power_id = db.Column(db.BigInteger, db.ForeignKey("riders.zwift_power_id"))
