from newZRL import db

class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    division = db.Column(db.String(50), nullable=False)
    captain_id = db.Column(db.String(255), nullable=True)
    captain_zwift_id = db.Column(db.BigInteger, nullable=True)
    league_id = db.Column(db.Integer, nullable=True)
    division_number = db.Column(db.Integer, nullable=True)

    # Relazione verso RiderTeam
    rider_teams = db.relationship("RiderTeam", back_populates="team")
