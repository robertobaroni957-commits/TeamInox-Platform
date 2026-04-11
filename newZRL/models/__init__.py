from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import dei modelli in modo che SQLAlchemy li conosca tutti
from .rider import Rider
from .team import Team
from .rider_team import RiderTeam
from .user import User
from .race_lineup import RaceLineup
from .round import Round 