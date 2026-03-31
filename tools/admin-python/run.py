import threading
import webbrowser
from flask import Flask, redirect, render_template
from flask_login import LoginManager
from db import close_db

# Blueprint principali
from blueprints.auth.routes import auth_bp
from blueprints.main.routes import main_bp
from blueprints.scrape.routes import scrape_bp
from blueprints.debug.routes import debug_bp
from blueprints.admin.routes.admin_reports import admin_reports_bp
from blueprints.admin.routes.admin_manage_users import admin_manage_users
from blueprints.ai_lineup import ai_lineup_bp
from blueprints.admin.routes.admin_leagues import admin_leagues_bp


# Blueprint moderator
from blueprints.moderator.routes import moderator_bp
from blueprints.moderator.moderator_teams import moderator_teams_bp


# Blueprint captain
from blueprints.captain.routes import all_blueprints as captain_blueprints
from blueprints.captain.routes.captain_dashboard import captain_panel


# Blueprint stagioni
from routes.seasons import seasons_bp

# Blueprint admin modulari
from blueprints.admin.routes import all_blueprints as admin_blueprints

# Modello utente per Flask-Login
from blueprints.auth.user_model import get_user_by_id  # Funzione che legge dal DB


def create_app():
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.secret_key = "supersegreto"
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.teardown_appcontext(close_db)

    # 🔑 Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message_category = "warning"

    @login_manager.user_loader
    def load_user(user_id):
        return get_user_by_id(user_id)

    # 🔧 Blueprint principali
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(scrape_bp)
    app.register_blueprint(debug_bp)
    app.register_blueprint(ai_lineup_bp)
    app.register_blueprint(admin_reports_bp, url_prefix="/admin/reports")
    app.register_blueprint(admin_leagues_bp)
    app.register_blueprint(admin_manage_users)
    app.register_blueprint(moderator_bp)
    app.register_blueprint(moderator_teams_bp)
    

    # 🔧 Blueprint admin modulari
    for bp in admin_blueprints:
        app.register_blueprint(bp)

    # 🔧 Blueprint captain
    for bp in captain_blueprints:
        app.register_blueprint(bp)
    

    # 🔧 Blueprint stagioni
    app.register_blueprint(seasons_bp)

    # 🔗 Route iniziale
    @app.route("/")
    def home():
        return redirect("/admin/dashboard")

    # ✅ Route di test sidebar
    @app.route("/test-sidebar")
    def test_sidebar():
        return render_template("test_sidebar.html")

    return app


# CREA L’OGGETTO app GLOBALE PER GUNICORN
app = create_app()


def open_browser():
    threading.Timer(1.0, lambda: webbrowser.open_new("http://localhost:5000/")).start()


if __name__ == "__main__":
    open_browser()
    app.run(debug=True)
