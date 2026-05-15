import os
import getpass
import sys
import importlib.util
from ZwiftPowerData import ZwiftPower

# Get the directory of the executable
script_dir = os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(script_dir, 'config.py')

def main():
    username = None
    password = None

    if os.path.exists(config_path):
        try:
            spec = importlib.util.spec_from_file_location("config", config_path)
            config = importlib.util.module_from_spec(spec)
            sys.modules["config"] = config
            spec.loader.exec_module(config)

            username = config.username
            password = config.password
        except AttributeError: # Catches if username or password are not defined in config.py
            print("Errore: 'username' o 'password' non definiti in config.py. Richiesta credenziali manuali.")
            username = input("Inserisci username ZwiftPower: ").strip()
            password = getpass.getpass("Inserisci password ZwiftPower: ").strip()
        except Exception as e:
            print(f"Errore durante il caricamento da '{config_path}': {e}. Richiesta credenziali manuali.")
            username = input("Inserisci username ZwiftPower: ").strip()
            password = getpass.getpass("Inserisci password ZwiftPower: ").strip()
    else:
        print(f"Il file '{config_path}' non trovato. Inserisci le credenziali manualmente.")
        username = input("Inserisci username ZwiftPower: ").strip()
        password = getpass.getpass("Inserisci password ZwiftPower: ").strip()

    if not username or not password:
        print("Errore: Username o password non forniti. Uscita.")
        return

    zp = ZwiftPower(username, password)

    event_id = input("🏁 Inserisci l'Event ID: ").strip()
    print(f"\n🚀 Avvio download JSON per evento {event_id}...\n")

    zp.download_event_json(event_id, base_dir=script_dir)

if __name__ == "__main__":
    main()
