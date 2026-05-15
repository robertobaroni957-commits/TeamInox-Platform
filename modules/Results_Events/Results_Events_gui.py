import tkinter as tk
from tkinter import messagebox, scrolledtext
import threading
import os
import sys
import importlib.util
from ZwiftPowerData import ZwiftPower # Assuming ZwiftPowerData.py is in the same directory
from PIL import Image, ImageTk # Import Pillow modules

# Get the directory of the executable
script_dir = os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(script_dir, 'config.py')

# Path to the logo image
# Note: For PyInstaller, this path needs to be handled carefully.
# If the image is bundled, it will be in the _MEIPASS folder at runtime.
# The user specified an absolute path, so we'll use that for direct testing.
logo_path = r"C:\Users\frara\OneDrive\Documenti\Team INOX\Team Inox Logo.png"

class RedirectText:
    """Class to redirect stdout to a tkinter scrolledtext widget."""
    def __init__(self, widget):
        self.widget = widget

    def write(self, text):
        self.widget.config(state=tk.NORMAL) # Enable writing
        self.widget.insert(tk.END, text)
        self.widget.see(tk.END) # Auto-scroll to the end
        self.widget.config(state=tk.DISABLED) # Disable writing

    def flush(self):
        pass # Required for file-like objects

class ZwiftPowerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Event Results by Zwift Power")
        
        # Set window icon
        try:
            icon_path = os.path.join(script_dir, 'icons8-ciclismo-su-pista-80.ico')
            if os.path.exists(icon_path):
                self.iconbitmap(icon_path)
        except tk.TclError:
            print(f"Warning: Could not load window icon from {icon_path}.")
            
        self.geometry("800x650") # Increased width and height for new layout

        self.zp = None # ZwiftPower object
        self.username = None
        self.password = None
        self.credentials_loaded_from_config = False

        # Register validation command for Event ID
        self.vcmd = (self.register(self._validate_event_id), '%P')

        self._create_widgets()
        self._load_credentials()

        # Redirect stdout to the status text widget
        sys.stdout = RedirectText(self.status_text)

        # Bind the resize event
        self.bind("<Configure>", self._resize_logo)

    def _validate_event_id(self, p_input):
        """Validates that the input is numeric and max 8 digits."""
        if p_input.isdigit() or p_input == "":
            return len(p_input) <= 8
        return False

    def _create_widgets(self):
        # Main container frame
        main_frame = tk.Frame(self)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Top frame for logo and controls
        top_frame = tk.Frame(main_frame)
        top_frame.pack(fill=tk.X)

        # --- Logo Panel (Left) ---
        logo_panel = tk.Frame(top_frame)
        logo_panel.grid(row=0, column=0, sticky="nw", padx=(0, 10))

        self.logo_label = tk.Label(logo_panel)
        self.logo_label.pack(anchor="nw")

        self.original_logo = None
        if os.path.exists(logo_path):
            try:
                self.original_logo = Image.open(logo_path)
                self.tk_logo = None # Will be set by _resize_logo
            except Exception as e:
                messagebox.showerror("Image Error", f"Could not load logo image: {e}")
                print(f"Error loading logo: {e}")
        else:
            print(f"Logo file not found at: {logo_path}")

        # --- Controls Panel (Right) ---
        controls_panel = tk.Frame(top_frame)
        controls_panel.grid(row=0, column=1, sticky="nsew")
        top_frame.grid_columnconfigure(1, weight=1)

        # --- Inputs Sub-frame ---
        inputs_frame = tk.Frame(controls_panel)
        inputs_frame.pack(fill=tk.X, pady=(0, 10))
        inputs_frame.grid_columnconfigure(1, weight=1)

        # Username
        self.username_label = tk.Label(inputs_frame, text="Username:")
        self.username_label.grid(row=0, column=0, sticky="w", pady=2)
        self.username_entry = tk.Entry(inputs_frame, width=30)
        self.username_entry.grid(row=0, column=1, sticky="ew", pady=2)

        # Password
        self.password_label = tk.Label(inputs_frame, text="Password:")
        self.password_label.grid(row=1, column=0, sticky="w", pady=2)
        self.password_entry = tk.Entry(inputs_frame, width=30, show='*')
        self.password_entry.grid(row=1, column=1, sticky="ew", pady=2)

        # Event ID
        tk.Label(inputs_frame, text="Event ID:").grid(row=2, column=0, sticky="w", pady=2)
        self.event_id_entry = tk.Entry(inputs_frame, width=20, state=tk.DISABLED, validate="key", validatecommand=self.vcmd)
        self.event_id_entry.grid(row=2, column=1, sticky="ew", pady=2)

        # --- Buttons Sub-frame ---
        buttons_frame = tk.Frame(controls_panel)
        buttons_frame.pack(fill=tk.X)
        
        # Login Button
        self.login_button = tk.Button(buttons_frame, text="Login", command=self._attempt_login_with_gui_creds, state=tk.DISABLED)
        self.login_button.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(0, 5))

        # Download Button
        self.download_button = tk.Button(buttons_frame, text="Download Event Data", command=self._start_download, state=tk.DISABLED)
        self.download_button.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(5, 0))

        # --- Bottom Part of the main_frame ---
        # Status Label for login
        self.login_status_label = tk.Label(main_frame, text="Login Status: Attempting...", anchor="w")
        self.login_status_label.pack(fill=tk.X, pady=(10, 5))

        # Scrolled Text for output/log
        self.status_text = scrolledtext.ScrolledText(main_frame, wrap=tk.WORD, height=15)
        self.status_text.pack(fill=tk.BOTH, expand=True, pady=5)

    def _resize_logo(self, event=None):
        if self.original_logo:
            # Get dimensions of the right_panel to resize logo relative to it
            if self.logo_label.winfo_width() == 0 or self.logo_label.winfo_height() == 0:
                # If window not yet drawn, defer resize
                self.after(100, self._resize_logo)
                return

            panel_width = self.logo_label.winfo_width()
            panel_height = self.logo_label.winfo_height()
            
            if panel_width == 0 or panel_height == 0:
                # Fallback if panel dimensions are still 0 (e.g., during initialization)
                panel_width = int(self.winfo_width() * 0.4) # Assume 40% of main window width
                panel_height = int(self.winfo_height() * 0.4) # Assume 40% of main window height
                if panel_width < 1: panel_width = 1
                if panel_height < 1: panel_height = 1


            # Set fixed width for the logo and calculate proportional height
            target_width = 200
            img_width, img_height = self.original_logo.size
            
            # Calculate the new height to maintain aspect ratio
            new_width = target_width
            new_height = int(img_height * (target_width / img_width))

            # Ensure image is not too small (e.g., if original is tiny)
            if new_height < 50 and img_height < img_width: # If image is very wide, prevent super small height
                new_height = 50
                new_width = int(new_height * (img_width / img_height))
            elif new_width < 50 and img_width < img_height: # If image is very tall, prevent super small width
                new_width = 50
                new_height = int(new_width * (img_height / img_width))



            resized_image = self.original_logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
            self.tk_logo = ImageTk.PhotoImage(resized_image)
            self.logo_label.config(image=self.tk_logo)
            self.logo_label.image = self.tk_logo # Keep a reference!

    def _toggle_cred_fields(self, visible):
        state = tk.NORMAL if visible else tk.DISABLED
        bg_color = self.cget('bg') if not visible else 'white' # Use default window background if not visible

        self.username_label.config(state=state)
        self.username_entry.config(state=state, bg=bg_color)
        self.password_label.config(state=state)
        self.password_entry.config(state=state, bg=bg_color)
        self.login_button.config(state=state)

        if not visible:
            self.username_entry.delete(0, tk.END)
            self.password_entry.delete(0, tk.END)
        
        # Also manage event ID and download button here
        event_state = tk.DISABLED if visible else tk.NORMAL
        self.event_id_entry.config(state=event_state)
        self.download_button.config(state=event_state)

    def _load_credentials(self):
        self.login_status_label.config(text="Login Status: Loading credentials...")
        
        if os.path.exists(config_path):
            try:
                spec = importlib.util.spec_from_file_location("config", config_path)
                config = importlib.util.module_from_spec(spec)
                sys.modules["config"] = config # Register the module
                spec.loader.exec_module(config)

                self.username = config.username
                self.password = config.password
                if self.username and self.password:
                    self.credentials_loaded_from_config = True
                    print("Credentials loaded from config.py.")
                    self.login_status_label.config(text="Login Status: Credentials loaded from config.py.")
                else:
                    print("Username or password not fully defined in config.py. Prompting for manual input.")

            except (AttributeError, Exception) as e:
                print(f"Error loading config.py: {e}")
                self.login_status_label.config(text="Login Status: Error in config.py. Please enter manually.")
        else:
            print(f"config.py not found at {config_path}. Please enter credentials manually.")
            self.login_status_label.config(text="Login Status: config.py not found. Please enter manually.")

        if not self.credentials_loaded_from_config:
            self._toggle_cred_fields(True) # Make credential fields and login button visible/editable
            self.login_button.config(state=tk.NORMAL) # Ensure login button is explicitly enabled
            self.login_status_label.config(text="Login Status: Enter credentials and click Login.")
        else:
            self._toggle_cred_fields(False) # Hide/disable credential fields and login button
            self._attempt_login() # Attempt login with loaded credentials

    def _attempt_login_with_gui_creds(self):
        # Get credentials from entry fields
        self.username = self.username_entry.get().strip()
        self.password = self.password_entry.get().strip()

        if not self.username or not self.password:
            messagebox.showwarning("Input Error", "Please enter both username and password.")
            return
        
        print("Attempting login with manual credentials from GUI fields...")
        self.login_status_label.config(text="Login Status: Attempting manual login...")
        self.login_button.config(state=tk.DISABLED) # Disable login button during login attempt

        # Perform login in a separate thread to keep GUI responsive
        threading.Thread(target=self._perform_manual_login, daemon=True).start()

    def _perform_manual_login(self):
        try:
            self.zp = ZwiftPower(self.username, self.password)
            self.login_status_label.config(text="Login Status: Logged in to ZwiftPower.")
            print("Manual login successful.")
            
            # Enable event ID and download fields, disable credential fields
            self.after(0, lambda: self._toggle_cred_fields(False))
            # _toggle_cred_fields(False) already enables event_id_entry and download_button
            # so no need for explicit enable here.

        except Exception as e:
            messagebox.showerror("Login Error", f"Failed to login to ZwiftPower: {e}")
            self.login_status_label.config(text="Login Status: Manual login failed. Please try again.")
            self.after(0, lambda: self.login_button.config(state=tk.NORMAL)) # Re-enable login button on failure
        finally:
            # The _toggle_cred_fields(False) call will handle reenabling download_button/event_id_entry
            # if login was successful.
            pass


    def _attempt_login(self):
        if self.username and self.password:
            try:
                self.login_status_label.config(text="Login Status: Logging in to ZwiftPower...")
                self.zp = ZwiftPower(self.username, self.password)
                self.login_status_label.config(text="Login Status: Logged in to ZwiftPower.")
                self.download_button.config(state=tk.NORMAL) # Enable button after successful login
                self.event_id_entry.config(state=tk.NORMAL) # Enable event ID entry

            except Exception as e:
                messagebox.showerror("Login Error", f"Failed to login to ZwiftPower: {e}")
                self.login_status_label.config(text="Login Status: Failed to login.")
                self.download_button.config(state=tk.DISABLED)
                self.event_id_entry.config(state=tk.DISABLED)
        else:
            self.download_button.config(state=tk.DISABLED)
            self.event_id_entry.config(state=tk.DISABLED)

    def _start_download(self):
        event_id = self.event_id_entry.get().strip()
        if not event_id:
            messagebox.showwarning("Input Error", "Please enter an Event ID.")
            return

        self.download_button.config(state=tk.DISABLED) # Disable button during download
        
        # Clear previous messages
        self.status_text.config(state=tk.NORMAL)
        self.status_text.delete(1.0, tk.END)
        self.status_text.config(state=tk.DISABLED)

        # Start download in a separate thread to keep GUI responsive
        threading.Thread(target=self._download_event_data, args=(event_id,), daemon=True).start()

    def _download_event_data(self, event_id):
        try:
            print(f"\n🚀 Avvio download JSON per evento {event_id}...\n")
            self.zp.download_event_json(event_id, base_dir=script_dir)
            print(f"\n✅ Download completato per evento {event_id}!")
        except Exception as e:
            print(f"\n❌ Errore durante il download dell'evento {event_id}: {e}")
            messagebox.showerror("Download Error", f"An error occurred during download: {e}")
        finally:
            self.download_button.config(state=tk.NORMAL) # Re-enable button

if __name__ == "__main__":
    app = ZwiftPowerApp()
    app.mainloop()
