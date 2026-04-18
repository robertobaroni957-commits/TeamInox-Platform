import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import threading
import os
import re

class InoxSyncApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Inoxteam Sync Manager v1.0")
        self.root.geometry("700x550")
        self.root.configure(bg="#121212")

        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Colori Inox
        self.orange = "#fc6719"
        self.dark_bg = "#121212"
        self.card_bg = "#1e1e1e"
        self.text_color = "#ffffff"

        self.setup_ui()
        self.load_cookie()

    def setup_ui(self):
        # Header
        header = tk.Frame(self.root, bg=self.orange, height=60)
        header.pack(fill="x")
        tk.Label(header, text="INOXTEAM SYNC CENTER", bg=self.orange, fg="black", 
                 font=("Arial", 16, "bold"), pady=15).pack()

        # Main Container
        main_frame = tk.Frame(self.root, bg=self.dark_bg, padx=20, pady=20)
        main_frame.pack(fill="both", expand=True)

        # Config Section
        config_frame = tk.LabelFrame(main_frame, text=" Configurazione WTRL ", bg=self.dark_bg, 
                                     fg=self.orange, font=("Arial", 10, "bold"), padx=10, pady=10)
        config_frame.pack(fill="x", marginBottom=20)

        tk.Label(config_frame, text="WTRL_COOKIE:", bg=self.dark_bg, fg="white").grid(row=0, column=0, sticky="w")
        self.cookie_entry = tk.Entry(config_frame, bg="#333", fg="white", insertbackground="white", borderwidth=0)
        self.cookie_entry.grid(row=0, column=1, sticky="ew", padx=10, pady=5)
        config_frame.columnconfigure(1, weight=1)

        btn_save = tk.Button(config_frame, text="Salva Cookie", bg="#444", fg="white", 
                             command=self.save_cookie, borderwidth=0, padx=10)
        btn_save.grid(row=0, column=2)

        # Buttons Grid
        actions_frame = tk.Frame(main_frame, bg=self.dark_bg, pady=20)
        actions_frame.pack(fill="x")

        self.btn_wtrl = self.create_action_button(actions_frame, "🔄 SYNC WTRL (D1)", self.run_wtrl_sync, 0)
        self.btn_master = self.create_action_button(actions_frame, "🏆 MASTER WINTER TOUR", self.run_master_sync, 1)
        self.btn_strava = self.create_action_button(actions_frame, "⚡ STRAVA LIVE EVENTS", self.run_strava_sync, 2)

        # Log Section
        tk.Label(main_frame, text="Log Operazioni:", bg=self.dark_bg, fg=self.orange, font=("Arial", 10, "bold")).pack(anchor="w")
        self.log_area = scrolledtext.ScrolledText(main_frame, bg="black", fg="#00ff00", 
                                                 font=("Consolas", 9), borderwidth=0)
        self.log_area.pack(fill="both", expand=True, pady=5)

    def create_action_button(self, parent, text, command, col):
        btn = tk.Button(parent, text=text, bg=self.card_bg, fg=self.orange, 
                        font=("Arial", 10, "bold"), height=2, borderwidth=1, 
                        relief="flat", highlightbackground=self.orange, command=command)
        btn.grid(row=0, column=col, sticky="ew", padx=5)
        parent.columnconfigure(col, weight=1)
        return btn

    def log(self, message):
        self.log_area.insert(tk.END, message + "\n")
        self.log_area.see(tk.END)

    def load_cookie(self):
        if os.path.exists(".dev.vars"):
            with open(".dev.vars", "r") as f:
                content = f.read()
                match = re.search(r'WTRL_COOKIE="(.+?)"', content)
                if match:
                    self.cookie_entry.insert(0, match.group(1))

    def save_cookie(self):
        cookie = self.cookie_entry.get().strip()
        if not cookie:
            messagebox.showwarning("Attenzione", "Il campo cookie è vuoto.")
            return
        
        content = ""
        if os.path.exists(".dev.vars"):
            with open(".dev.vars", "r") as f:
                content = f.read()
        
        if 'WTRL_COOKIE=' in content:
            new_content = re.sub(r'WTRL_COOKIE=".+?"', f'WTRL_COOKIE="{cookie}"', content)
        else:
            new_content = content + f'\nWTRL_COOKIE="{cookie}"'
        
        with open(".dev.vars", "w") as f:
            f.write(new_content.strip())
        
        self.log("✅ Cookie salvato in .dev.vars")
        messagebox.showinfo("Successo", "Cookie salvato correttamente.")

    def run_command(self, cmd, success_msg):
        def task():
            self.log(f"🚀 Esecuzione: {' '.join(cmd)}")
            try:
                process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, 
                                           text=True, shell=True)
                for line in process.stdout:
                    self.log(line.strip())
                process.wait()
                if process.returncode == 0:
                    self.log(f"✨ {success_msg}")
                else:
                    self.log(f"❌ Errore (Exit Code: {process.returncode})")
            except Exception as e:
                self.log(f"❌ Eccezione: {str(e)}")
        
        threading.Thread(target=task).start()

    def run_wtrl_sync(self):
        self.run_command(["node", "scripts/sync_inox_data.cjs"], "Sincronizzazione WTRL completata!")

    def run_master_sync(self):
        self.log("ℹ️ Master Winter Tour Sync: Funzionalità in arrivo...")
        # In futuro: self.run_command(["python", "scripts/sync_master_winter.py"], ...)

    def run_strava_sync(self):
        self.log("ℹ️ Strava Live Sync: Funzionalità in arrivo...")
        # In futuro: self.run_command(["node", "scripts/sync_strava_events.js"], ...)

if __name__ == "__main__":
    root = tk.Tk()
    app = InoxSyncApp(root)
    root.mainloop()
