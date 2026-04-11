from werkzeug.security import generate_password_hash
from newZRL import create_app
from newZRL.models import db
from newZRL.models.user import User

def create_user(email, password, zwift_power_id, role='admin', team_id=None, active=1):
    app = create_app()  # crea l'app Flask

    with app.app_context():  # 🔑 contesto dell'app
        # Controlla se l'utente esiste
        if User.query.filter_by(email=email).first():
            print(f"⚠️ Utente con email '{email}' già esistente.")
            return

        # Crea nuovo utente
        hashed_pw = generate_password_hash(password)
        new_user = User(
            email=email,
            password=hashed_pw,
            zwift_power_id=zwift_power_id,
            role=role,
            team_id=team_id,
            active=active
        )
        db.session.add(new_user)
        db.session.commit()
        print(f"✅ Utente '{email}' creato con ruolo '{role}' e ZwiftPower ID '{zwift_power_id}'")

# Esempio di utilizzo
if __name__ == "__main__":
    create_user(
        email="admin@teaminox.it",
        password="password123",
        zwift_power_id="2975361",
        role="admin"
    )
