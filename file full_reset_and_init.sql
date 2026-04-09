 1     -- FULL RESET SCRIPT - REVISED FOR FK CONSTRAINTS AND DATA POPULATION
    2     PRAGMA foreign_keys = OFF;
    3
    4     -- 1. Delete from referencing tables first
    5     -- Cancella prima da tabelle che puntano alle squadre o agli atleti
    6     DELETE FROM team_members;
    7     DELETE FROM race_lineup;
    8     DELETE FROM availability;
    9     DELETE FROM user_time_preferences;
   10     DELETE FROM results; -- Assumendo che results possa dipendere da teams/athletes o round
   11
   12     -- 2. Delete from parent tables
   13     -- Ora possiamo cancellare le squadre e gli atleti (mantenendo l'admin con zwid=1)
   14     DELETE FROM teams;
   15     DELETE FROM athletes WHERE zwid != 1; -- Mantiene l'admin se ha zwid=1
   16
   17     -- 3. INSERT TEAMS
   18     -- Inserisce le squadre del Team Inox (basato su dati estratti da squadre_wtrl.json)
   19     INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('TEAM INOX LOL',
      75258, 'D', 'Lime', '#BFFF00');
   20     INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('TEAM INOX
      MONSTERS', 75151, 'C', 'Emerald', '#50C878');
   21     INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('Team INOX
      Trinacria', 74930, 'B', 'Blue', '#0000FF');
   22     INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor) VALUES ('Team INOX
      TURTLES', 75570, 'D', 'Mint', '#98FF98');
   23     -- Aggiungi qui altre squadre TEAM INOX se le hai trovate (es. ELITE, BERSERK, DEV, etc.)
   24     -- Controlla la tua lista completa di squadre TEAM INOX in squadre_wtrl.json per nomi esatti e ID WTRL.
   25
   26     -- 4. INSERT ATHLETES (Da TEAM INFO.json)
   27     -- Assumendo che TEAM INFO.json sia nella stessa directory o accessibile.
   28     -- Utilizza INSERT OR IGNORE per evitare errori se uno zwid esiste già.
   29     -- Mappa le colonne: A=name, B=category, C=email, D=teamName, F=zwid
   30     INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role) VALUES (3252657, 'Andrea Cerri',
      'a.cerri75@gmail.com', 'B', 'user');
   31     INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role) VALUES (1684452, 'BERSERK TEAM
      MEMBER', 'berserk@example.com', '?', 'user'); -- Dati di esempio, da verificare/aggiornare
   32     INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role) VALUES (6922219, 'Nicholas Malvicini',
      'nicholas.malvi@yahoo.com', 'B', 'user');
   33     -- ... aggiungi qui altre righe INSERT per gli atleti dal tuo file TEAM INFO.json o CSV ...
   34     -- Se hai già eseguito import_inox_csv.cjs con successo per gli atleti, queste righe potrebbero essere
      ridondanti ma non dannose grazie a INSERT OR IGNORE.
   35
   36     -- 5. INSERT TEAM MEMBERSHIPS
   37     -- Associa gli atleti alle squadre. Questo usa un subquery per trovare l'ID della squadra basato sul nome.
   38     -- ASSICURATI CHE I NOMI DELLE SQUADRE QUI (es. 'BERSERK') CORRISPONDANO ESATTAMENTE A QUELLI NEL DB E NEL CSV
      (colonna D).
   39     INSERT OR IGNORE INTO team_members (team_id, athlete_id)
   40     SELECT T.id, 3252657 FROM teams T WHERE T.name = 'BERSERK'; -- Esempio: Associa Andrea Cerri
   41     INSERT OR IGNORE INTO team_members (team_id, athlete_id)
   42     SELECT T.id, 1684452 FROM teams T WHERE T.name = 'BERSERK'; -- Esempio: Associa atleta BERSERK
   43     INSERT OR IGNORE INTO team_members (team_id, athlete_id)
   44     SELECT T.id, 6922219 FROM teams T WHERE T.name = 'BERSERK'; -- Esempio: Associa Nicholas Malvicini
   45     -- ... aggiungi qui altre associazioni basate sui dati del CSV (colonna D per team name) e gli ZwiftID ...
   46     -- Ad esempio, per gli atleti TEAM INOX TURTLES:
   47     INSERT OR IGNORE INTO team_members (team_id, athlete_id) SELECT T.id, <ZWID_ATLETA> FROM teams T WHERE T.name
      = 'Team INOX TURTLES';
   48
   49     -- 6. INSERT ADMIN USER (con ZwiftID fisso 1)
   50     INSERT OR REPLACE INTO athletes (zwid, name, email, password_hash, role)
   51     VALUES (1, 'Admin Inox', 'admin@teaminox.it', '$2a$12$0aDurDL548QrlpUXGr/0Oe1RltTyrxwx6Z4uXpIu65g1KTk1AWft6',
      'admin'); -- Password: admin123
   52
   53     PRAGMA foreign_keys = ON;