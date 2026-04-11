from datetime import datetime
from newZRL import db

class Captain(db.Model):
    __tablename__ = "captains"

    id = db.Column(db.Integer, primary_key=True)
    zwift_power_id = db.Column(db.BigInteger, db.ForeignKey("riders.zwift_power_id"))
    name = db.Column(db.String(255))
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"))
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean, default=True)

    rider = db.relationship("Rider")
    team = db.relationship("Team", back_populates="captains")
