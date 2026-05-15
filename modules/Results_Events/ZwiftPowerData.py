import os
import json
import time
import requests
import re
from bs4 import BeautifulSoup


class ZwiftPower:

    def __init__(self, username, password):
        self.session = self._login(username, password)

    # ---------------------------------------------------------
    # LOGIN
    # ---------------------------------------------------------
    def _login(self, username, password):
        session = requests.Session()
        session.headers.update({'user-agent': 'Mozilla/5.0'})

        try:
            print("🔐 Login su ZwiftPower...")

            # 1) Redirect alla pagina di login
            r1 = session.get(
                "https://zwiftpower.com/ucp.php?mode=login&login=external&oauth_service=oauthzpsso",
                allow_redirects=False,
                timeout=15
            )

            # 2) Carica il form di login
            r2 = session.get(r1.headers["location"], allow_redirects=False, timeout=15)
            form = BeautifulSoup(r2.text, "html.parser").find(id="form")
            action = form["action"]

            # 3) Login
            payload = {"username": username, "password": password, "rememberMe": "on"}
            r3 = session.post(action, data=payload, allow_redirects=False, timeout=15)

            # 4) Completa il login
            session.get(r3.headers["location"], timeout=15)

            print("✅ Login completato\n")

        except Exception as e:
            raise RuntimeError(f"❌ Errore login ZwiftPower: {e}")

        return session

    # ---------------------------------------------------------
    # REQUEST con retry automatico
    # ---------------------------------------------------------
    def _safe_request(self, url, max_retries=4, base_sleep=2):
        for attempt in range(1, max_retries + 1):
            try:
                resp = self.session.get(url, timeout=20)

                if resp.status_code == 200:
                    return resp

                print(f"⚠️ Tentativo {attempt}/{max_retries} - "
                      f"Status {resp.status_code}, retry fra {base_sleep}s...")

            except Exception as e:
                print(f"⚠️ Tentativo {attempt}/{max_retries} - errore rete: {e}")

            time.sleep(base_sleep)

        raise RuntimeError(f"❌ Impossibile ottenere dati da {url}")

    # ---------------------------------------------------------
    # SCRAPE EVENT DETAILS (DEFINITIVO)
    # ---------------------------------------------------------
    def scrape_event_details(self, event_id, event_folder):
        print("\n[+] Analizzo l'HTML dell'evento...")
        url = f"https://zwiftpower.com/events.php?zid={event_id}"
        details = {
            "event_id": event_id, 
            "url": url,
            "title": "Non trovato",
            "start_time": "Non trovato",
            "route": "Non trovato",
            "distance": "Non trovato",
            "elevation": "Non trovato",
            "laps": "Non trovato",
            "description": "Non trovata"
        }

        try:
            resp = self._safe_request(url)
            soup = BeautifulSoup(resp.content, "html.parser")

            # --- Estrazione Dati Principali dal contenitore #rdetails_body ---
            main_container = soup.find("div", id="rdetails_body")
            
            if main_container:
                # Titolo
                title_tag = main_container.find("h3")
                if title_tag:
                    details["title"] = title_tag.get_text(strip=True)

                # Data/Ora
                date_tag = main_container.find("span", id="EVENT_DATE")
                if date_tag:
                    details["start_time"] = date_tag.get_text(strip=True)

                # Route & Laps
                header_div = main_container.find('div', id='header_details')
                if header_div:
                    br_tag = header_div.find('br')
                    if br_tag: # Check if br_tag exists
                        next_sib = br_tag.next_sibling
                        if next_sib: # Check if next_sib exists
                            route_text = str(next_sib).strip()
                            if route_text:
                                details["route"] = route_text
                    
                    laps_icon = header_div.find('i', class_='fa-retweet')
                    if laps_icon: # Check if laps_icon exists
                        next_sib_laps = laps_icon.next_sibling
                        if next_sib_laps: # Check if next_sib_laps exists
                            laps_text = str(next_sib_laps).strip()
                            if laps_text:
                                details["laps"] = laps_text.split('\xa0')[0]

                # Distanza e Dislivello (dati più precisi in #category_detail)
                category_div = main_container.find('div', id='category_detail')
                if category_div:
                    span_pull_right = category_div.find('span', class_='pull-right')
                    if span_pull_right:
                        full_text = span_pull_right.get_text(" ", strip=True)
                        distance_match = re.search(r"Distance: ([\d\.]+) km", full_text, re.IGNORECASE)
                        if distance_match:
                            details["distance"] = f"{distance_match.group(1)} km"
                        elevation_match = re.search(r"Elevation Gain: ([\d\.]+) m", full_text, re.IGNORECASE)
                        if elevation_match:
                            details["elevation"] = f"{elevation_match.group(1)} m"

            # --- Estrazione Descrizione dal contenitore #rinfo_body ---
            description_container = soup.find("div", id="rinfo_body")
            if description_container:
                description_p = description_container.find("p", class_="event_info")
                if description_p:
                    details["description"] = description_p.get_text("\n", strip=True)

            # Scrittura del file JSON
            path = os.path.join(event_folder, "event_details.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(details, f, indent=2, ensure_ascii=False)

            print(f"   ✔ Dettagli salvati in event_details.json")

        except Exception as e:
            print(f"   ❌ Errore finale durante lo scraping: {e}")


    # ---------------------------------------------------------
    # DOWNLOAD EVENT JSON
    # ---------------------------------------------------------
    def download_event_json(self, event_id, output_dir="gare", base_dir=None):

        if base_dir:
            event_folder = os.path.join(base_dir, output_dir, str(event_id))
        else:
            event_folder = os.path.join(output_dir, str(event_id))
        
        os.makedirs(event_folder, exist_ok=True)
        
        # --- Scarica dettagli evento ---
        self.scrape_event_details(event_id, event_folder)
        # -------------------------------

        # Lista JSON da scaricare con nomi nuovi
        downloads = {
            "fin.json": 
                f"https://zwiftpower.com/cache3/results/{event_id}_view.json"
        }

        for cat in ["A", "B", "C", "D", "E"]:
            # msec → fal_{cat}.json
            downloads[f"fal_{cat}.json"] = (
                "https://zwiftpower.com/api3.php?"
                f"do=event_primes&zid={event_id}&category={cat}&prime_type=msec"
            )

            # elapsed → fts_{cat}.json
            downloads[f"fts_{cat}.json"] = (
                "https://zwiftpower.com/api3.php?"
                f"do=event_primes&zid={event_id}&category={cat}&prime_type=elapsed"
            )

        total = len(downloads)
        print(f"\n📥 Download JSON dei risultati per evento {event_id} ({total} file)...\n")

        # Download effettivo
        for idx, (file_name, url) in enumerate(downloads.items(), start=1):
            print(f"[{idx}/{total}] Scarico {file_name}...")

            try:
                resp = self._safe_request(url)

                try:
                    data = resp.json()
                except json.JSONDecodeError:
                    print("⚠️ Risposta non in JSON valido, salvo come testo.")
                    data = {"raw_text": resp.text}

                path = f"{event_folder}/{file_name}"
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

                print(f"   ✔ Salvato in {file_name}")

            except Exception as e:
                print(f"   ❌ Errore su {file_name}: {e}")

        print(f"\n✅ Completato! File salvati in: {event_folder}\n")
