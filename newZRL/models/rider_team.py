from newZRL import db

class RiderTeam(db.Model):
    __tablename__ = "rider_teams"

    id = db.Column(db.Integer, primary_key=True)
    rider_id = db.Column(db.BigInteger, db.ForeignKey("riders.zwift_power_id"))
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"))

    # Relazioni corrette
    rider = db.relationship("Rider", back_populates="rider_teams")
    team = db.relationship("Team", back_populates="rider_teams")
