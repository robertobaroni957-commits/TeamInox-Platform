# newZRL/__init__.py
from flask import Flask           # 🔹 Import necessario
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# 🔹 Estensioni globali
db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.login_message_category = "warning"

def create_app():
    # 🔹 Creazione app Flask
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates"
    )
    app.config.from_object("newZRL.config.Config")

    # 🔹 Inizializzazione estensioni
    db.init_app(app)
    login_manager.init_app(app)

    # 🔹 User loader Flask-Login
    from newZRL.models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # 🔹 Blueprint principali
    from newZRL.blueprints.auth.routes import auth_bp
    from newZRL.blueprints.admin_teams.routes import admin_teams_bp
    from newZRL.blueprints.main.routes import main_bp

    # 🔹 Blueprint admin modulare
    from newZRL.blueprints.admin.bp import admin_bp
    from newZRL.blueprints.admin.reports import admin_reports_bp
    from newZRL.blueprints.admin.import_riders import admin_import_riders_bp
    from newZRL.blueprints.admin_imports.routes import admin_imports_bp
    from newZRL.blueprints.admin.races import admin_races_bp

    # Import dei moduli admin solo per registrare le route
    import newZRL.blueprints.admin.dashboard
    import newZRL.blueprints.admin.teams
    import newZRL.blueprints.admin.leagues
    import newZRL.blueprints.admin.races
    import newZRL.blueprints.admin.reports

    # 🔹 Registrazione blueprint
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(admin_teams_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_reports_bp)
    app.register_blueprint(admin_import_riders_bp)
    app.register_blueprint(admin_imports_bp)
    app.register_blueprint(admin_races_bp)

    return app
