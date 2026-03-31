# blueprints/captain/routes/__init__.py

from .captain_dashboard import captain_panel
from .lineup import lineup_bp
from .availability import availability_bp

# Metti tutti i blueprint in una lista
all_blueprints = [captain_panel, lineup_bp, availability_bp]


