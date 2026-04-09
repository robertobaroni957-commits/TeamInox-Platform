 1 -- FULL RESET SCRIPT - REVISED FOR FK CONSTRAINTS AND DATA POPULATION
    2 PRAGMA foreign_keys = OFF;
    3
    4 -- 1. Delete from referencing tables first
    5 -- Cancella prima da tabelle che puntano alle squadre o agli atleti
    6 DELETE FROM team_members;
    7 DELETE FROM race_lineup;
    8 DELETE FROM availability;
    9 DELETE FROM user_time_preferences;
   10 DELETE FROM results; -- Assumendo che results possa dipendere da teams/athletes o round
   11
   12 -- 2. Delete from parent tables
   13 -- Ora possiamo cancellare le squadre e gli atleti (mantenendo l'admin con zwid=1)
   14 DELETE FROM teams;
   15 DELETE FROM athletes WHERE zwid != 1; -- Mantiene l'admin se ha zwid=1
   16
   17 -- 3. INSERT TEAMS
   18 -- Inserisce le squadre del Team Inox (basato su dati estratti da squadre_wtrl.json)
   19 -- Assicurati che i nomi delle squadre qui corrispondano esattamente a quelli nel tuo TEAM INFO.json (colonna D)
   20 INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('TEAM INOX LOL',
      75258, 'D', 'Lime', '#BFFF00');
   21 INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('TEAM INOX MONSTERS',
      75151, 'C', 'Emerald', '#50C878');
   22 INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('Team INOX
      Trinacria', 74930, 'B', 'Blue', '#0000FF');
   23 INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('Team INOX TURTLES',
      75570, 'D', 'Mint', '#98FF98');
   24 -- Aggiungi qui altre squadre TEAM INOX se le hai trovate nel file squadre_wtrl.json (es. ELITE, BERSERK, DEV,
      etc.)
   25 -- Se hai bisogno di aggiungere altre squadre specifiche, puoi farlo manualmente qui o aggiornare lo script.
   26
   27 -- 4. INSERT ATHLETES (Da TEAM INFO.json)
   28 -- Questo script presuppone che il file TEAM INFO.json sia nella stessa directory o accessibile.
   29 -- Utilizza INSERT OR IGNORE per evitare errori se uno zwid esiste già.
   30 -- NOTA: La colonna D nel CSV è usata come nome squadra, che verrà poi mappato ai team inseriti sopra.
   31 INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role) VALUES (3252657, 'Andrea Cerri',
      'a.cerri75@gmail.com', 'B', 'user');
   32 INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role) VALUES (1684452, 'BERSERK',
      'berserk@example.com', '?', 'user'); -- Assicurati che i dati siano corretti
   33 INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role) VALUES (6922219, 'Nicholas Malvicini',
      'nicholas.malvi@yahoo.com', 'B', 'user');
   34 -- ... aggiungi qui altre righe INSERT per gli atleti dal tuo file TEAM INFO.json o CSV, mappando correttamente le
      colonne ...
   35 -- Se hai già eseguito import_inox_csv.cjs con successo, potresti voler commentare/rimuovere queste righe INSERT
      per gli atleti
   36 -- e fidarti delle associazioni che farai al passo successivo basate sul nome squadra.
   37
   38 -- 5. INSERT TEAM MEMBERSHIPS
   39 -- Associa gli atleti alle squadre. Questo usa un subquery per trovare l'ID della squadra basato sul nome.
   40 -- Assicurati che i nomi delle squadre qui corrispondano esattamente a quelli inseriti nella tabella 'teams'
      sopra.
   41 INSERT OR IGNORE INTO team_members (team_id, athlete_id)
   42 SELECT T.id, 3252657 FROM teams T WHERE T.name = 'BERSERK'; -- Esempio: Associa Andrea Cerri alla squadra BERSERK
   43 INSERT OR IGNORE INTO team_members (team_id, athlete_id)
   44 SELECT T.id, 1684452 FROM teams T WHERE T.name = 'BERSERK'; -- Esempio per BERSERK atleta
   45 INSERT OR IGNORE INTO team_members (team_id, athlete_id)
   46 SELECT T.id, 6922219 FROM teams T WHERE T.name = 'BERSERK'; -- Esempio: Associa Nicholas Malvicini
   47 -- ... aggiungi qui altre associazioni basate sui dati del CSV (colonna D per team name) e gli ZwiftID ...
   48 -- NOTA: Potrebbe essere necessario un lavoro manuale qui per mappare correttamente i nomi delle squadre dal CSV
      agli ID delle squadre inserite.
   49
   50 -- 6. INSERT ADMIN USER (con ZwiftID fisso 1)
   51 INSERT OR REPLACE INTO athletes (zwid, name, email, password_hash, role)
   52 VALUES (1, 'Admin Inox', 'admin@teaminox.it', '$2a$12$0aDurDL548QrlpUXGr/0Oe1RltTyrxwx6Z4uXpIu65g1KTk1AWft6',
      'admin'); -- Password: admin123
   53
   54 PRAGMA foreign_keys = ON;