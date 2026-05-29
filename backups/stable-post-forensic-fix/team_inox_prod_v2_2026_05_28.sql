PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0000_init_season_schema.sql','2026-05-27 05:47:37');
CREATE TABLE season_table (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE rounds_table (
    id TEXT PRIMARY KEY,
    season_id TEXT NOT NULL,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    wtrl_id INTEGER NOT NULL,
    FOREIGN KEY (season_id) REFERENCES season_table(id)
);
CREATE TABLE zrl_seasons (
    id INTEGER PRIMARY KEY, 
    name TEXT NOT NULL, 
    external_season_id INTEGER, 
    is_active BOOLEAN DEFAULT 0
);
INSERT INTO "zrl_seasons" VALUES(1,'2026/27',20,1);
INSERT INTO "zrl_seasons" VALUES(19,'ZRL 2025/26',NULL,1);
CREATE TABLE zrl_round_groups (
    id INTEGER PRIMARY KEY, 
    series_id INTEGER, 
    round_index INTEGER, 
    external_season_id INTEGER, 
    description TEXT, 
    is_closed BOOLEAN DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES zrl_seasons(id)
);
CREATE TABLE zrl_races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zrl_round_group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT,
    FOREIGN KEY (zrl_round_group_id) REFERENCES zrl_round_groups(id)
);
CREATE TABLE zrl_team_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    round_group_id INTEGER NOT NULL, 
    league_key TEXT NOT NULL, 
    league_name TEXT,
    team_name TEXT NOT NULL, 
    rank INTEGER, 
    league_points INTEGER, 
    pts_fal INTEGER, 
    pts_fts INTEGER, 
    pts_finish INTEGER, 
    total_race_points INTEGER,
    r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT, 
    is_inox BOOLEAN DEFAULT 0,
    FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id)
);
CREATE TABLE division_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT NOT NULL,
    rider_name TEXT NOT NULL,
    zwid INTEGER,
    position INTEGER,
    points_total INTEGER,
    is_inox BOOLEAN DEFAULT 0,
    FOREIGN KEY (round_id) REFERENCES zrl_races(id)
);
CREATE TABLE zrl_season_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    sequence_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT,
    trace_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE zrl_orchestrator_locks (
    season_id INTEGER PRIMARY KEY,
    owner_token TEXT NOT NULL,
    expires_at DATETIME NOT NULL
);
CREATE TABLE zrl_sequence_tracker (
    season_id INTEGER PRIMARY KEY,
    last_sequence_number INTEGER DEFAULT 0
);
INSERT INTO "zrl_sequence_tracker" VALUES(19,2);
CREATE TABLE zrl_idempotency_keys (
    idempotency_key TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    result_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE athletes (zwid INTEGER PRIMARY KEY, name TEXT, email TEXT, password_hash TEXT, role TEXT, base_category TEXT, gender TEXT, created_at DATETIME, avatar_url TEXT);
INSERT INTO "athletes" VALUES(1,'AdminInox','admin@teaminox.it','$2a$10$TbkXbOilsflTR3ahCJ4KJOka7SQY.EgLj6vxoBp5UOdYzOZ1DhP5W','admin',NULL,NULL,NULL,'https://static-cdn.zwift.com/prod/profile/1');
INSERT INTO "athletes" VALUES(15737,'Gregg Christy2927',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/15737');
INSERT INTO "athletes" VALUES(35914,'Igor Molino (Team Italy)',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/35914');
INSERT INTO "athletes" VALUES(42382,'Alberto Ianiro (INOX)',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/42382');
INSERT INTO "athletes" VALUES(47727,'Andrew Robbins [BRAT]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/47727');
INSERT INTO "athletes" VALUES(54521,'Danny Thomson',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/54521');
INSERT INTO "athletes" VALUES(139067,'Nathan Penland [Dragons]🐲',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/139067');
INSERT INTO "athletes" VALUES(164627,'Ricardo Santos',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/164627');
INSERT INTO "athletes" VALUES(199374,'Matteo Casadei [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/199374');
INSERT INTO "athletes" VALUES(209528,'Aaron Barnett',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/209528');
INSERT INTO "athletes" VALUES(213007,'Jerry Freeman',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/213007');
INSERT INTO "athletes" VALUES(214801,'Renato Nardello',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/214801');
INSERT INTO "athletes" VALUES(227084,'Stefano Caffarri',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/227084');
INSERT INTO "athletes" VALUES(260568,'Grzegorz Neubauer [SYN]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/260568');
INSERT INTO "athletes" VALUES(276415,'S tevie Blunder TT1',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/276415');
INSERT INTO "athletes" VALUES(296309,'Norberto Civardi',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/296309');
INSERT INTO "athletes" VALUES(315064,'Capski Buttinski [ZiMA] 70+',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/315064');
INSERT INTO "athletes" VALUES(397261,'Chris Musgrove Inox',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/397261');
INSERT INTO "athletes" VALUES(409802,'Martin Croxall',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/409802');
INSERT INTO "athletes" VALUES(413798,'Francesco Avesani [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/413798');
INSERT INTO "athletes" VALUES(439868,'Miky Tedesco',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439868');
INSERT INTO "athletes" VALUES(439870,'Gianmarco Donetti',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439870');
INSERT INTO "athletes" VALUES(439871,'Luigi Buso',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439871');
INSERT INTO "athletes" VALUES(439873,'Roberto Pegoraro',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439873');
INSERT INTO "athletes" VALUES(439874,'Massimiliano Caccia',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439874');
INSERT INTO "athletes" VALUES(439876,'giuseppe durante',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439876');
INSERT INTO "athletes" VALUES(439877,'Giulio Strazzulla',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439877');
INSERT INTO "athletes" VALUES(439879,'Luca Durighel [INOX]',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439879');
INSERT INTO "athletes" VALUES(439937,'Francesco Ravasi',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439937');
INSERT INTO "athletes" VALUES(439938,'Giancarlo Rugolo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439938');
INSERT INTO "athletes" VALUES(439939,'Claudio Varani',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439939');
INSERT INTO "athletes" VALUES(439940,'Luca Adamo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439940');
INSERT INTO "athletes" VALUES(439941,'Thomas Fischer',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439941');
INSERT INTO "athletes" VALUES(439942,'Marco Esposito [INOX]',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439942');
INSERT INTO "athletes" VALUES(439943,'Michael Kirscht INOX',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439943');
INSERT INTO "athletes" VALUES(439944,'Viciu Pacciu',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439944');
INSERT INTO "athletes" VALUES(439945,'claudio ubertini',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439945');
INSERT INTO "athletes" VALUES(439946,'Luca SAMPAOLESI',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439946');
INSERT INTO "athletes" VALUES(439947,'Fabio Ghislotti [INOX]',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439947');
INSERT INTO "athletes" VALUES(439948,'umberto dianzani',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439948');
INSERT INTO "athletes" VALUES(439949,'Nicola Mancini',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439949');
INSERT INTO "athletes" VALUES(439951,'Fabio Bertoldi',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439951');
INSERT INTO "athletes" VALUES(439953,'Luca Adamo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439953');
INSERT INTO "athletes" VALUES(439955,'claudio ubertini',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439955');
INSERT INTO "athletes" VALUES(439956,'Cristian Pelosi',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439956');
INSERT INTO "athletes" VALUES(439957,'Alessio Nisini',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/439957');
INSERT INTO "athletes" VALUES(440477,'Raffaele Santoni',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440477');
INSERT INTO "athletes" VALUES(440478,'manuel magnotti',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440478');
INSERT INTO "athletes" VALUES(440479,'Paulin Z. CJ TT1D',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440479');
INSERT INTO "athletes" VALUES(440480,'Claudio Fioravanti',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440480');
INSERT INTO "athletes" VALUES(440481,'David Grosso',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440481');
INSERT INTO "athletes" VALUES(440482,'Roberto Regno',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440482');
INSERT INTO "athletes" VALUES(440483,'Andrea Castori',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440483');
INSERT INTO "athletes" VALUES(440485,'Graziano Gabrieli',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440485');
INSERT INTO "athletes" VALUES(440486,'Dario Paparella',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/440486');
INSERT INTO "athletes" VALUES(441665,'Andrea Cerri [INOX]',NULL,NULL,NULL,'Aplus',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/441665');
INSERT INTO "athletes" VALUES(442021,'Marco Giuradei [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/442021');
INSERT INTO "athletes" VALUES(442616,'Anthony Howard',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/442616');
INSERT INTO "athletes" VALUES(442617,'Andy Jones',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/442617');
INSERT INTO "athletes" VALUES(442618,'Luca Durighel [INOX]',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/442618');
INSERT INTO "athletes" VALUES(442620,'Antonio Bove',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/442620');
INSERT INTO "athletes" VALUES(442621,'Massimo Spagnoli',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/442621');
INSERT INTO "athletes" VALUES(442622,'Gaetano Lo verde',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/442622');
INSERT INTO "athletes" VALUES(444171,'Roberto Baroni',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444171');
INSERT INTO "athletes" VALUES(444172,'Maximilian Mione',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444172');
INSERT INTO "athletes" VALUES(444173,'Chris Musgrove',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444173');
INSERT INTO "athletes" VALUES(444174,'Vincenzo Larocca',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444174');
INSERT INTO "athletes" VALUES(444177,'Giancarlo Rugolo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444177');
INSERT INTO "athletes" VALUES(444178,'Marco Esposito [INOX]',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444178');
INSERT INTO "athletes" VALUES(444179,'Cristian Pelosi',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444179');
INSERT INTO "athletes" VALUES(444180,'Claudio Varani',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444180');
INSERT INTO "athletes" VALUES(444181,'umberto dianzani',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444181');
INSERT INTO "athletes" VALUES(444845,'Roberto Sanna',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444845');
INSERT INTO "athletes" VALUES(444846,'Michael Kirscht INOX',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444846');
INSERT INTO "athletes" VALUES(444847,'Salvatore Matarazzo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444847');
INSERT INTO "athletes" VALUES(444848,'Sandro Giusti',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444848');
INSERT INTO "athletes" VALUES(444849,'Davide Bertin',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444849');
INSERT INTO "athletes" VALUES(444850,'Michele Puri',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444850');
INSERT INTO "athletes" VALUES(444852,'Cesare Pisacane',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/444852');
INSERT INTO "athletes" VALUES(445225,'Diego Burattini',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/445225');
INSERT INTO "athletes" VALUES(445227,'Matteo Fumagalli',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/445227');
INSERT INTO "athletes" VALUES(445229,'Simone Oppezzo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/445229');
INSERT INTO "athletes" VALUES(445230,'Massimo Spagnoli',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/445230');
INSERT INTO "athletes" VALUES(445231,'Luca Durighel [INOX]',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/445231');
INSERT INTO "athletes" VALUES(445232,'Oz Onder',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/445232');
INSERT INTO "athletes" VALUES(445233,'Federico Garavaglia',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/445233');
INSERT INTO "athletes" VALUES(447412,'Ricardo Santos',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/447412');
INSERT INTO "athletes" VALUES(447413,'Miky Tedesco',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/447413');
INSERT INTO "athletes" VALUES(447416,'Mario Cavallaro',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/447416');
INSERT INTO "athletes" VALUES(447419,'luca briccoli',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/447419');
INSERT INTO "athletes" VALUES(447420,'Pierpaolo Varvazzo',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/447420');
INSERT INTO "athletes" VALUES(447421,'Loris Van de kassteele',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/447421');
INSERT INTO "athletes" VALUES(447422,'giuseppe durante',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/447422');
INSERT INTO "athletes" VALUES(448516,'Raffaele Santoni',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448516');
INSERT INTO "athletes" VALUES(448517,'Paolo Pellegrini',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448517');
INSERT INTO "athletes" VALUES(448518,'manuel magnotti',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448518');
INSERT INTO "athletes" VALUES(448519,'Paulin Z. CJ TT1D',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448519');
INSERT INTO "athletes" VALUES(448520,'Claudio Fioravanti',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448520');
INSERT INTO "athletes" VALUES(448521,'David Grosso',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448521');
INSERT INTO "athletes" VALUES(448522,'Roberto Regno',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448522');
INSERT INTO "athletes" VALUES(448523,'Andrea Castori',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448523');
INSERT INTO "athletes" VALUES(448524,'Alberto Ianiro',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448524');
INSERT INTO "athletes" VALUES(448525,'Giovanni Cingolani',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/448525');
INSERT INTO "athletes" VALUES(454855,'Mauro Nana',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/454855');
INSERT INTO "athletes" VALUES(455169,'Paolo Spadaro',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455169');
INSERT INTO "athletes" VALUES(455172,'Paolo Spadaro',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455172');
INSERT INTO "athletes" VALUES(455314,'Diego Burattini',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455314');
INSERT INTO "athletes" VALUES(455366,'Francesco Ravasi',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455366');
INSERT INTO "athletes" VALUES(455396,'Simone Oppezzo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455396');
INSERT INTO "athletes" VALUES(455410,'Mik D''andrea',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455410');
INSERT INTO "athletes" VALUES(455422,'Viciu Pacciu',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455422');
INSERT INTO "athletes" VALUES(455436,'Luca SAMPAOLESI',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455436');
INSERT INTO "athletes" VALUES(455442,'Chris Musgrove',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455442');
INSERT INTO "athletes" VALUES(455520,'Cristian Bonafé',NULL,NULL,NULL,'D',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455520');
INSERT INTO "athletes" VALUES(455754,'Thomas Fischer',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455754');
INSERT INTO "athletes" VALUES(455766,'Luca SAMPAOLESI',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455766');
INSERT INTO "athletes" VALUES(455773,'Marco Esposito [INOX]',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455773');
INSERT INTO "athletes" VALUES(455910,'Francesco Ravasi',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455910');
INSERT INTO "athletes" VALUES(455916,'Matteo Fumagalli',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455916');
INSERT INTO "athletes" VALUES(455944,'Giancarlo Rugolo',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/455944');
INSERT INTO "athletes" VALUES(455992,'Giovanni Nucera',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/455992');
INSERT INTO "athletes" VALUES(456178,'Cristian Collesei',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/456178');
INSERT INTO "athletes" VALUES(456195,'Luca Bille',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/456195');
INSERT INTO "athletes" VALUES(456218,'Cristian Collesei',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/456218');
INSERT INTO "athletes" VALUES(456341,'Andy Jones',NULL,NULL,NULL,'C',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/456341');
INSERT INTO "athletes" VALUES(456384,'Luca Bille',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/456384');
INSERT INTO "athletes" VALUES(456393,'André Kofler [ITA SWAT]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/456393');
INSERT INTO "athletes" VALUES(456442,'luca briccoli',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/456442');
INSERT INTO "athletes" VALUES(456443,'Pierpaolo Varvazzo',NULL,NULL,NULL,'B',NULL,NULL,'https://static-cdn.zwift.com/prod/profile/456443');
INSERT INTO "athletes" VALUES(475715,'Simo Oppe [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/475715');
INSERT INTO "athletes" VALUES(490979,'David Kellogg-BMTR',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/490979');
INSERT INTO "athletes" VALUES(497406,'Claudio Naselli [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/497406');
INSERT INTO "athletes" VALUES(537810,'Tommaso Conforti',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/537810');
INSERT INTO "athletes" VALUES(673756,'Pasquato ivan [Inox]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/673756');
INSERT INTO "athletes" VALUES(766165,'Adrian Kloster [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/766165');
INSERT INTO "athletes" VALUES(786727,'Alessandro Donetti',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/786727');
INSERT INTO "athletes" VALUES(810115,'Loris van de Kassteele (Velos)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/810115');
INSERT INTO "athletes" VALUES(819162,'Russell Young',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/819162');
INSERT INTO "athletes" VALUES(831531,'sean moore',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/831531');
INSERT INTO "athletes" VALUES(835079,'T. Claudio ( Italy)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/835079');
INSERT INTO "athletes" VALUES(846208,'JP Provost [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/846208');
INSERT INTO "athletes" VALUES(848922,'David Crisp',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/848922');
INSERT INTO "athletes" VALUES(898636,'frederich costa[ITA SWATT]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/898636');
INSERT INTO "athletes" VALUES(900612,'Martino Sabia [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/900612');
INSERT INTO "athletes" VALUES(902450,'Gianpiero Musarò [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/902450');
INSERT INTO "athletes" VALUES(904546,'giuseppe durante',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/904546');
INSERT INTO "athletes" VALUES(906430,'Matteo Marsetti',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/906430');
INSERT INTO "athletes" VALUES(931830,'6 gaetano Lo Verde (INOX)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/931830');
INSERT INTO "athletes" VALUES(943471,'Salvo Matarazzo [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/943471');
INSERT INTO "athletes" VALUES(966756,'Fabio Bertoldi [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/966756');
INSERT INTO "athletes" VALUES(992889,'Jose Chaves',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/992889');
INSERT INTO "athletes" VALUES(1001244,'Lester of golden Moonlight (ZRG)',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1001244');
INSERT INTO "athletes" VALUES(1018362,'Andrea Corbara[inox]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1018362');
INSERT INTO "athletes" VALUES(1039041,'J ester',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1039041');
INSERT INTO "athletes" VALUES(1047283,'Roberto Vietti [DIRT]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1047283');
INSERT INTO "athletes" VALUES(1069919,'Srinivas Gokulnath',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1069919');
INSERT INTO "athletes" VALUES(1076112,'Simone Magi [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/1076112');
INSERT INTO "athletes" VALUES(1101089,'marc carrera',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1101089');
INSERT INTO "athletes" VALUES(1105970,'TEWE [INOX/ZTBR]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1105970');
INSERT INTO "athletes" VALUES(1110228,'Fabrizio Bicchietti [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1110228');
INSERT INTO "athletes" VALUES(1120055,'A J (inox madness)',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1120055');
INSERT INTO "athletes" VALUES(1121337,'LUCA PASTORI',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/1121337');
INSERT INTO "athletes" VALUES(1141125,'Tony Howard (Inox)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1141125');
INSERT INTO "athletes" VALUES(1152951,'Miky Tedesco [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1152951');
INSERT INTO "athletes" VALUES(1199129,'Roberto Sambo',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/1199129');
INSERT INTO "athletes" VALUES(1202409,'Italiafile Johnston',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1202409');
INSERT INTO "athletes" VALUES(1210704,'Olaf (INOX) 🤙',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1210704');
INSERT INTO "athletes" VALUES(1237268,'nicola mancini [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1237268');
INSERT INTO "athletes" VALUES(1406131,'Emmanuel CUET [ASVEL] (ZLIT) *VM* 6580',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1406131');
INSERT INTO "athletes" VALUES(1461193,'Geordy Daws',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1461193');
INSERT INTO "athletes" VALUES(1469978,'Jeff Bolton',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1469978');
INSERT INTO "athletes" VALUES(1484672,'Johnni be Good [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/1484672');
INSERT INTO "athletes" VALUES(1520796,'Michele D''Andrea [Inox]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1520796');
INSERT INTO "athletes" VALUES(1548408,'Markus Amplatz [ITA]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1548408');
INSERT INTO "athletes" VALUES(1564205,'Cristian Marcotto [INOX-ITA]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1564205');
INSERT INTO "athletes" VALUES(1573619,'Robby Regno (INOX)',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1573619');
INSERT INTO "athletes" VALUES(1628264,'A Brandtoft #KST#',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1628264');
INSERT INTO "athletes" VALUES(1644288,'David Kuntz',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1644288');
INSERT INTO "athletes" VALUES(1652663,'Graziano Gabrieli [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1652663');
INSERT INTO "athletes" VALUES(1675839,'Manu Lafforgue',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1675839');
INSERT INTO "athletes" VALUES(1682095,'ViciuPacciu [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1682095');
INSERT INTO "athletes" VALUES(1785306,'Alessandro Visconti[INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/1785306');
INSERT INTO "athletes" VALUES(1791956,'Cesare Carminati',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1791956');
INSERT INTO "athletes" VALUES(1797268,'Paolo Pellegrini',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/1797268');
INSERT INTO "athletes" VALUES(1801398,'Maurizio Messeri [ITA5]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1801398');
INSERT INTO "athletes" VALUES(1804867,'Hugo Pecellin [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/1804867');
INSERT INTO "athletes" VALUES(1811855,'Francesco Cisko [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/1811855');
INSERT INTO "athletes" VALUES(1821578,'Cesare Pisacane [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1821578');
INSERT INTO "athletes" VALUES(1823555,'Matteo Magni (SST)',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1823555');
INSERT INTO "athletes" VALUES(1839454,'Matteo Crosa Lenz [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/1839454');
INSERT INTO "athletes" VALUES(1842490,'Luca Briccoli [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1842490');
INSERT INTO "athletes" VALUES(1867799,'Massimo Fabbri [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/1867799');
INSERT INTO "athletes" VALUES(1881490,'Daniel Monachello',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/1881490');
INSERT INTO "athletes" VALUES(1897358,'Giovanni Lisi',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1897358');
INSERT INTO "athletes" VALUES(1900916,'Michele Puri [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1900916');
INSERT INTO "athletes" VALUES(1902051,'Pit Conrad [Klub]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1902051');
INSERT INTO "athletes" VALUES(1916504,'Alex de Santisteban UAC (TSE)',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/1916504');
INSERT INTO "athletes" VALUES(1943746,'Massimiliano Casnati',NULL,NULL,'athlete','A+','M',NULL,'https://static-cdn.zwift.com/prod/profile/1943746');
INSERT INTO "athletes" VALUES(1992085,'Claudio Varo [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1992085');
INSERT INTO "athletes" VALUES(1995551,'Nathan Robertson3518',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1995551');
INSERT INTO "athletes" VALUES(1995882,'Fabio Michele Coratella [ITA 2]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/1995882');
INSERT INTO "athletes" VALUES(2006706,'Francesco Salis [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2006706');
INSERT INTO "athletes" VALUES(2040540,'Mirko Pistolozzi INOX',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2040540');
INSERT INTO "athletes" VALUES(2124374,'Paolo Casarini [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2124374');
INSERT INTO "athletes" VALUES(2139266,'Matteo Marangoni',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/2139266');
INSERT INTO "athletes" VALUES(2148682,'Raffaele Santoni [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/2148682');
INSERT INTO "athletes" VALUES(2187820,'Luca Riccio',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2187820');
INSERT INTO "athletes" VALUES(2197162,'Dario Paparella',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/2197162');
INSERT INTO "athletes" VALUES(2253341,'MICHELE VIOLA(ITA-INOX-AAB)',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/2253341');
INSERT INTO "athletes" VALUES(2320632,'Giovanni Guerrera (INOX)',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/2320632');
INSERT INTO "athletes" VALUES(2332799,'Andrea D@W',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/2332799');
INSERT INTO "athletes" VALUES(2336555,'Davide Bertin[INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/2336555');
INSERT INTO "athletes" VALUES(2360782,'2. Davide Rufo (D@W)',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/2360782');
INSERT INTO "athletes" VALUES(2418694,'luca centioni[SWATTCLUB]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2418694');
INSERT INTO "athletes" VALUES(2425903,'Tobi Klesen',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2425903');
INSERT INTO "athletes" VALUES(2454868,'Marco Imola [INOX][ITA]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/2454868');
INSERT INTO "athletes" VALUES(2606135,'SIMONE GENTILI (ITA)',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/2606135');
INSERT INTO "athletes" VALUES(2690375,'Mario Cavallaro [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/2690375');
INSERT INTO "athletes" VALUES(2708681,'The Mighty Shrimp',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/2708681');
INSERT INTO "athletes" VALUES(2752564,'Roman Hensel',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2752564');
INSERT INTO "athletes" VALUES(2846874,'Alessandro Gabrieli [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/2846874');
INSERT INTO "athletes" VALUES(2886091,'Andrea Bianconcini K31 👻[INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/2886091');
INSERT INTO "athletes" VALUES(2889372,'Diego Burattini [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/2889372');
INSERT INTO "athletes" VALUES(2895594,'PIERRE JULIEN [VCO]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/2895594');
INSERT INTO "athletes" VALUES(2975361,'Roberto Baroni [ INOX ]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/2975361');
INSERT INTO "athletes" VALUES(3011267,'Wout van Wannabe',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/3011267');
INSERT INTO "athletes" VALUES(3017268,'Joel Boelke',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/3017268');
INSERT INTO "athletes" VALUES(3035490,'Shaun DaBeast',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/3035490');
INSERT INTO "athletes" VALUES(3049348,'John Peters',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/3049348');
INSERT INTO "athletes" VALUES(3059451,'Claudio Ubertini [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/3059451');
INSERT INTO "athletes" VALUES(3092045,'Cristian Collesei [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/3092045');
INSERT INTO "athletes" VALUES(3121024,'Dany Bon [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/3121024');
INSERT INTO "athletes" VALUES(3139160,'Peppe Malinconico INOX',NULL,NULL,'athlete','A+','M',NULL,'https://static-cdn.zwift.com/prod/profile/3139160');
INSERT INTO "athletes" VALUES(3165807,'Andrea Castori [ INOX ]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/3165807');
INSERT INTO "athletes" VALUES(3169461,'MARCO FARINA [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/3169461');
INSERT INTO "athletes" VALUES(3184906,'Martin Rombach',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/3184906');
INSERT INTO "athletes" VALUES(3194563,'Filippo Scotoni 4524',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/3194563');
INSERT INTO "athletes" VALUES(3196182,'M. Abisso89 [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/3196182');
INSERT INTO "athletes" VALUES(3208463,'Luca Bollani [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/3208463');
INSERT INTO "athletes" VALUES(3209124,'Angelo Parise',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/3209124');
INSERT INTO "athletes" VALUES(3251469,'Cosimo Gualano [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/3251469');
INSERT INTO "athletes" VALUES(3252657,'Andrea Cerri',NULL,NULL,'athlete','A+','M',NULL,'https://static-cdn.zwift.com/prod/profile/3252657');
INSERT INTO "athletes" VALUES(3287400,'Filippo Grasso (Team Italy 2)',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/3287400');
INSERT INTO "athletes" VALUES(3432509,'Andrea Falchetti [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/3432509');
INSERT INTO "athletes" VALUES(3499743,'Elvis Gatta [INOX] Sprint Bike Lumezzane',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/3499743');
INSERT INTO "athletes" VALUES(3509403,'Renato Coco [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/3509403');
INSERT INTO "athletes" VALUES(3526308,'Omar Saglietti',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/3526308');
INSERT INTO "athletes" VALUES(3605633,'Ale Volt [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/3605633');
INSERT INTO "athletes" VALUES(3621244,'Peter Brockhaus',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/3621244');
INSERT INTO "athletes" VALUES(3668635,'Salvatore Cannazza [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/3668635');
INSERT INTO "athletes" VALUES(3891733,'Pessimo Varvazzo [Inox]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/3891733');
INSERT INTO "athletes" VALUES(4184968,'Panagiotis Manousaridis',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4184968');
INSERT INTO "athletes" VALUES(4209127,'Antonio Bove [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4209127');
INSERT INTO "athletes" VALUES(4314738,'Teto pezz [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4314738');
INSERT INTO "athletes" VALUES(4333414,'paolo spadaro [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4333414');
INSERT INTO "athletes" VALUES(4344470,'Tommaso Scaramuzzino',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4344470');
INSERT INTO "athletes" VALUES(4353051,'Emanuele Russo',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4353051');
INSERT INTO "athletes" VALUES(4369191,'ADAMO LUCA [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4369191');
INSERT INTO "athletes" VALUES(4376881,'Mike Donohue',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/4376881');
INSERT INTO "athletes" VALUES(4379545,'Mirko Gritti [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/4379545');
INSERT INTO "athletes" VALUES(4383852,'ANDREA CAPRA',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4383852');
INSERT INTO "athletes" VALUES(4386482,'Claudio Van Stock (INOX)',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/4386482');
INSERT INTO "athletes" VALUES(4430242,'Michele Bonometti',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4430242');
INSERT INTO "athletes" VALUES(4431468,'Simone Mingo [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4431468');
INSERT INTO "athletes" VALUES(4480037,'Simon Lapierre [Dragons]🐲',NULL,NULL,'athlete','A+','M',NULL,'https://static-cdn.zwift.com/prod/profile/4480037');
INSERT INTO "athletes" VALUES(4483917,'Paulin Z. CJ TT1D [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/4483917');
INSERT INTO "athletes" VALUES(4514178,'Robert Schulz',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4514178');
INSERT INTO "athletes" VALUES(4562674,'Georgios Filiousis [TSE]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4562674');
INSERT INTO "athletes" VALUES(4578777,'3 Mirko [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4578777');
INSERT INTO "athletes" VALUES(4583700,'Sandro Giusti (INOX)',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4583700');
INSERT INTO "athletes" VALUES(4622555,'Alessio Nisini [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4622555');
INSERT INTO "athletes" VALUES(4645426,'filippo cogiamanian',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4645426');
INSERT INTO "athletes" VALUES(4651499,'Sakis Vettis [EPICA]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/4651499');
INSERT INTO "athletes" VALUES(4651873,'FIORE ROBERTINO',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4651873');
INSERT INTO "athletes" VALUES(4661355,'Mattia Ferrini [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4661355');
INSERT INTO "athletes" VALUES(4686799,'Roberto Pegoraro [Inox]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4686799');
INSERT INTO "athletes" VALUES(4719640,'Ulrich Extermann',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4719640');
INSERT INTO "athletes" VALUES(4734277,'Roberto Sciaccaluga [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4734277');
INSERT INTO "athletes" VALUES(4834697,'Simone Cianferoni [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/4834697');
INSERT INTO "athletes" VALUES(4840724,'Kai Mittelmann [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4840724');
INSERT INTO "athletes" VALUES(4856666,'Antonio Ceredi (ITA3)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4856666');
INSERT INTO "athletes" VALUES(4870988,'.Mauro (TSE)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/4870988');
INSERT INTO "athletes" VALUES(4899770,'Claudio Scavo',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/4899770');
INSERT INTO "athletes" VALUES(5015562,'1 Cristian Modolin[INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/5015562');
INSERT INTO "athletes" VALUES(5023502,'Thomas Fischer',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/5023502');
INSERT INTO "athletes" VALUES(5061824,'Franco Fiorentino [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5061824');
INSERT INTO "athletes" VALUES(5127808,'Sebastian Reeck',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5127808');
INSERT INTO "athletes" VALUES(5145191,'Paolo Pontonio [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5145191');
INSERT INTO "athletes" VALUES(5153886,'Onder Oz[INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/5153886');
INSERT INTO "athletes" VALUES(5191249,'Tiziano Speranza [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5191249');
INSERT INTO "athletes" VALUES(5207789,'Live Team Inox',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5207789');
INSERT INTO "athletes" VALUES(5214842,'Massimo Pira_1971',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/5214842');
INSERT INTO "athletes" VALUES(5225516,'S. Erbetta',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5225516');
INSERT INTO "athletes" VALUES(5280007,'Massimiliano Caccia [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5280007');
INSERT INTO "athletes" VALUES(5281288,'Mathieu Baglan',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/5281288');
INSERT INTO "athletes" VALUES(5307541,'Mario Belussi',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/5307541');
INSERT INTO "athletes" VALUES(5311216,'Halil Cetinbas',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5311216');
INSERT INTO "athletes" VALUES(5326476,'Jack Regier(OTE)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5326476');
INSERT INTO "athletes" VALUES(5327554,'Norves Lazzarini [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5327554');
INSERT INTO "athletes" VALUES(5330540,'DAVIDE FACCHIN',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5330540');
INSERT INTO "athletes" VALUES(5372432,'Maximilian Mione [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/5372432');
INSERT INTO "athletes" VALUES(5376917,'Danilo Mazzola [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5376917');
INSERT INTO "athletes" VALUES(5401300,'Giovanni Maria Barbin',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5401300');
INSERT INTO "athletes" VALUES(5425127,'Dave OCarroll (ERCC)',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/5425127');
INSERT INTO "athletes" VALUES(5521222,'Daje 88 ]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5521222');
INSERT INTO "athletes" VALUES(5526266,'Paolo Baldas [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5526266');
INSERT INTO "athletes" VALUES(5556575,'Daniele Marzari [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5556575');
INSERT INTO "athletes" VALUES(5577047,'Mauro Nana Inox',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/5577047');
INSERT INTO "athletes" VALUES(5618670,'AGP 21',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5618670');
INSERT INTO "athletes" VALUES(5650560,'Andrea Erba',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5650560');
INSERT INTO "athletes" VALUES(5702975,'Mike Lucinsky INOX',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/5702975');
INSERT INTO "athletes" VALUES(5783213,'Bruno Biancardi',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/5783213');
INSERT INTO "athletes" VALUES(5794051,'Valerio Vassallo',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/5794051');
INSERT INTO "athletes" VALUES(5797700,'Thomas Borghese',NULL,NULL,'athlete','A+','M',NULL,'https://static-cdn.zwift.com/prod/profile/5797700');
INSERT INTO "athletes" VALUES(5908339,'Joao Pedro Rodrigues Branquinho',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5908339');
INSERT INTO "athletes" VALUES(5917647,'Alan Vector [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/5917647');
INSERT INTO "athletes" VALUES(5927549,'roberto castori [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5927549');
INSERT INTO "athletes" VALUES(5932502,'Gabriele Conti',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5932502');
INSERT INTO "athletes" VALUES(5949065,'Tomer Kenan',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/5949065');
INSERT INTO "athletes" VALUES(5959655,'Giuseppe Liccardo [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/5959655');
INSERT INTO "athletes" VALUES(5965851,'Guido Lamet',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/5965851');
INSERT INTO "athletes" VALUES(5985006,'Roberto Capasso',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/5985006');
INSERT INTO "athletes" VALUES(6012732,'stefano bordi [inox]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6012732');
INSERT INTO "athletes" VALUES(6022604,'Valentino Birolini',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6022604');
INSERT INTO "athletes" VALUES(6031113,'Andrea Galeotti',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6031113');
INSERT INTO "athletes" VALUES(6046042,'Bastiano Coimbra Azevedo',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6046042');
INSERT INTO "athletes" VALUES(6057042,'Gero [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6057042');
INSERT INTO "athletes" VALUES(6057167,'Federico Garavaglia',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6057167');
INSERT INTO "athletes" VALUES(6059566,'Antonio Caramia[INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6059566');
INSERT INTO "athletes" VALUES(6063066,'David Grosso',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/6063066');
INSERT INTO "athletes" VALUES(6064280,'Michelangelo Ianzito',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6064280');
INSERT INTO "athletes" VALUES(6078848,'Birgit Scheffer',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/6078848');
INSERT INTO "athletes" VALUES(6105089,'Faris Chihab',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6105089');
INSERT INTO "athletes" VALUES(6109036,'Giancarlo Rugolo [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6109036');
INSERT INTO "athletes" VALUES(6117581,'paul spadaro [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6117581');
INSERT INTO "athletes" VALUES(6132334,'federico Zucca[ITA]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6132334');
INSERT INTO "athletes" VALUES(6134007,'. Sloth',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6134007');
INSERT INTO "athletes" VALUES(6139819,'Luca Durighel [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6139819');
INSERT INTO "athletes" VALUES(6145554,'Michele Cervellin [INOX]',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/6145554');
INSERT INTO "athletes" VALUES(6155651,'Graziano Borelli [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/6155651');
INSERT INTO "athletes" VALUES(6172044,'Umberto Dianzani [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6172044');
INSERT INTO "athletes" VALUES(6272522,'T Om LEVEL 🚀',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6272522');
INSERT INTO "athletes" VALUES(6287052,'Pietro Capra',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6287052');
INSERT INTO "athletes" VALUES(6291122,'Zeno Sempreboni [ITA]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6291122');
INSERT INTO "athletes" VALUES(6306811,'ALESSANDRO SARDO',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6306811');
INSERT INTO "athletes" VALUES(6345533,'Mark Tighe',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6345533');
INSERT INTO "athletes" VALUES(6354912,'Horse. Crasy[inox]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6354912');
INSERT INTO "athletes" VALUES(6426346,'Gigio Santamaria [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6426346');
INSERT INTO "athletes" VALUES(6432653,'Cristian Raimo [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6432653');
INSERT INTO "athletes" VALUES(6438753,'Facundo Llambias',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/6438753');
INSERT INTO "athletes" VALUES(6441343,'Vincenzo Larocca',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6441343');
INSERT INTO "athletes" VALUES(6465392,'Ulisse Bellucci',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6465392');
INSERT INTO "athletes" VALUES(6486170,'Samantha Forte',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6486170');
INSERT INTO "athletes" VALUES(6562494,'Matteo Fumagalli [ATF]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6562494');
INSERT INTO "athletes" VALUES(6731694,'Alessandro Sozzi',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6731694');
INSERT INTO "athletes" VALUES(6745513,'Massimo Picozzi',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/6745513');
INSERT INTO "athletes" VALUES(6778481,'Giovanni Bettega',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/6778481');
INSERT INTO "athletes" VALUES(6781105,'Emanuele Andreoni [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6781105');
INSERT INTO "athletes" VALUES(6796084,'L Main',NULL,NULL,'athlete','A+','M',NULL,'https://static-cdn.zwift.com/prod/profile/6796084');
INSERT INTO "athletes" VALUES(6797127,'Cristian Pelosi [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6797127');
INSERT INTO "athletes" VALUES(6801312,'Luca Bille [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6801312');
INSERT INTO "athletes" VALUES(6811945,'Marco Esposito [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6811945');
INSERT INTO "athletes" VALUES(6873542,'Jon Hall',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/6873542');
INSERT INTO "athletes" VALUES(6922219,'Nico Malvicini [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/6922219');
INSERT INTO "athletes" VALUES(6940707,'Claudio News',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/6940707');
INSERT INTO "athletes" VALUES(6944697,'Roberto C. (TSE)',NULL,NULL,'athlete','A','M',NULL,'https://static-cdn.zwift.com/prod/profile/6944697');
INSERT INTO "athletes" VALUES(6965131,'Sebastian Helm',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/6965131');
INSERT INTO "athletes" VALUES(7001570,'Stefano Caccia [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/7001570');
INSERT INTO "athletes" VALUES(7072727,'Street Hawk [INOX]',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/7072727');
INSERT INTO "athletes" VALUES(7101358,'Guido Senzauto',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/7101358');
INSERT INTO "athletes" VALUES(7121469,'Massimo Spagnoli (INOX)',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/7121469');
INSERT INTO "athletes" VALUES(7197230,'Giuseppe Carbonari [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/7197230');
INSERT INTO "athletes" VALUES(7371977,'Roberto Sanna [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/7371977');
INSERT INTO "athletes" VALUES(7463714,'Michael Kirscht',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/7463714');
INSERT INTO "athletes" VALUES(7480908,'Eveline Decock [WATT]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/7480908');
INSERT INTO "athletes" VALUES(7506263,'Mattia Milchick [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/7506263');
INSERT INTO "athletes" VALUES(7553796,'Jonah .M',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/7553796');
INSERT INTO "athletes" VALUES(7563772,'Samuele Curradi [INOX]',NULL,NULL,'athlete','B','M',NULL,'https://static-cdn.zwift.com/prod/profile/7563772');
INSERT INTO "athletes" VALUES(7590897,'Mike Cox',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/7590897');
INSERT INTO "athletes" VALUES(7596532,'Luca SAMPAOLESI [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/7596532');
INSERT INTO "athletes" VALUES(7603081,'Giovanni Cingolani [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/7603081');
INSERT INTO "athletes" VALUES(7659233,'Fabio Ghislotti [INOX]',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/7659233');
INSERT INTO "athletes" VALUES(7670305,'A🚴🚴‍♂️Rosario',NULL,NULL,'athlete','','M',NULL,'https://static-cdn.zwift.com/prod/profile/7670305');
INSERT INTO "athletes" VALUES(7735580,'Cristian Bonafé [INOX]',NULL,NULL,'athlete','D','M',NULL,'https://static-cdn.zwift.com/prod/profile/7735580');
INSERT INTO "athletes" VALUES(7806825,'Gabriele Forzelin Inox',NULL,NULL,'athlete','C','M',NULL,'https://static-cdn.zwift.com/prod/profile/7806825');
CREATE TABLE series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    external_season_id INTEGER,
    scoring_type TEXT DEFAULT 'points',
    is_active BOOLEAN DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME
);
INSERT INTO "series" VALUES(1,'ZRL Season 19',19,'points',1,NULL,NULL);
CREATE TABLE rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER REFERENCES series(id),
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT,
    zwift_event_id INTEGER,
    format TEXT DEFAULT 'Scratch',
    distance REAL DEFAULT 0,
    elevation REAL DEFAULT 0,
    powerups TEXT,
    strategy_details TEXT,
    category TEXT DEFAULT 'ALL'
, raw_json TEXT, laps INTEGER, status TEXT);
INSERT INTO "rounds" VALUES(2,1,'Race 1','2026-04-07T08:00:00Z','FRANCE','Hell of the North',NULL,'Scratch',19.8,241.311,NULL,NULL,'A','{"race":1,"tags":["forcedpowerupid=1","timestamp=1773828708289","wtrl","zrl","zrl19","zrl_arch","no_flagging","steering_disabled","nobraking","new_race_results","ttt","ttbikesdraft","starting_powerup=1"],"rules":"SHOW_RACE_RESULTS","duration":1,"paceType":1,"segments":[],"eventDate":"2026-04-07T08:00:00Z","courseFull":"FRANCE_Hell_of_the_North","courseName":"Hell of the North","raceFormat":"wtrlttt","courseWorld":"FRANCE","subgroup_label":"A","courseDifficulty":3,"lapAscentInMeters":241.311,"lapDistanceInMeters":19816,"leadinAscentInMeters":0,"leadinDistanceInMeters":336}',1,'planned');
INSERT INTO "rounds" VALUES(3,1,'Race 2','2026-04-14T08:00:00Z','WATOPIA','The Classic',NULL,'Scratch',4.8,48.448,NULL,NULL,'A','{"race":2,"tags":["wtrl","zrl","zrl19","zrl_arch","no_flagging","nobraking","new_race_results","starting_powerup=0","arch_powerup=\"0,1,81,5,82,0\"","timestamp=1773181306447","steering_disabled"],"rules":"NO_TT_BIKES;SHOW_RACE_RESULTS","duration":6,"paceType":1,"segments":[{"segmentId":115,"segmentName":"Jarvis FWD Climb","segmentVisits":6},{"segmentId":113,"segmentName":"Jarvis FWD Sprint","segmentVisits":6}],"eventDate":"2026-04-14T08:00:00Z","courseFull":"WATOPIA_The_Classic","courseName":"The Classic","raceFormat":"race","courseWorld":"WATOPIA","subgroup_label":"A","courseDifficulty":2,"lapAscentInMeters":48.448,"lapDistanceInMeters":4836,"leadinAscentInMeters":16.084,"leadinDistanceInMeters":4181}',6,'planned');
INSERT INTO "rounds" VALUES(4,1,'Race 3','2026-04-21T08:00:00Z','FRANCE','Croissant',NULL,'Scratch',9.3,49.29,NULL,NULL,'A','{"race":3,"tags":["zrl19","wtrl","zrl","zrl_arch","no_flagging","nobraking","new_race_results","starting_powerup=1","powerup_percent=\"0,33,1,33,5,34\"","timestamp=1773081202157","steering_disabled"],"rules":"SHOW_RACE_RESULTS;NO_TT_BIKES","duration":4,"paceType":1,"segments":[],"eventDate":"2026-04-21T08:00:00Z","courseFull":"FRANCE_Croissant","courseName":"Croissant","raceFormat":"scratch","courseWorld":"FRANCE","subgroup_label":"A","courseDifficulty":2,"lapAscentInMeters":49.29,"lapDistanceInMeters":9273,"leadinAscentInMeters":23.219,"leadinDistanceInMeters":3241}',4,'planned');
INSERT INTO "rounds" VALUES(5,1,'Race 4','2026-04-28T08:00:00Z','NEWYORK','Double Span Spin',NULL,'Scratch',7,79.972,NULL,NULL,'A','{"race":4,"tags":["wtrl","zrl","zrl19","zrl_arch","no_flagging","steering_disabled","nobraking","new_race_results","starting_powerup=5","arch_powerup=\"11,0,10,5\"","timestamp=1773081364519"],"rules":"NO_TT_BIKES;SHOW_RACE_RESULTS","duration":5,"paceType":1,"segments":[{"segmentId":130,"segmentName":"Manhattan REV Sprint","segmentVisits":6},{"segmentId":133,"segmentName":"Brooklyn Bridge FWD Climb","segmentVisits":5}],"eventDate":"2026-04-28T08:00:00Z","courseFull":"NEWYORK_Double_Span_Spin","courseName":"Double Span Spin","raceFormat":"race","courseWorld":"NEWYORK","subgroup_label":"A","courseDifficulty":4,"lapAscentInMeters":79.972,"lapDistanceInMeters":7018,"leadinAscentInMeters":39.754,"leadinDistanceInMeters":5567}',5,'planned');
INSERT INTO "rounds" VALUES(6,1,'Race 1','2026-04-07T08:00:00Z','FRANCE','Hell of the North',NULL,'Scratch',19.8,241.311,NULL,NULL,'C','{"race":1,"tags":["forcedpowerupid=1","timestamp=1773828708289","wtrl","zrl","zrl19","zrl_arch","no_flagging","steering_disabled","nobraking","new_race_results","ttt","ttbikesdraft","starting_powerup=1"],"rules":"SHOW_RACE_RESULTS","duration":1,"paceType":1,"segments":[],"eventDate":"2026-04-07T08:00:00Z","courseFull":"FRANCE_Hell_of_the_North","courseName":"Hell of the North","raceFormat":"wtrlttt","courseWorld":"FRANCE","subgroup_label":"C","courseDifficulty":3,"lapAscentInMeters":241.311,"lapDistanceInMeters":19816,"leadinAscentInMeters":0,"leadinDistanceInMeters":336}',1,'planned');
INSERT INTO "rounds" VALUES(7,1,'Race 2','2026-04-14T08:00:00Z','WATOPIA','The Classic',NULL,'Scratch',4.8,48.448,NULL,NULL,'C','{"race":2,"tags":["wtrl","zrl","zrl19","zrl_arch","no_flagging","nobraking","new_race_results","starting_powerup=0","arch_powerup=\"0,1,81,5,82,0\"","timestamp=1773181306447","steering_disabled"],"rules":"NO_TT_BIKES;SHOW_RACE_RESULTS","duration":4,"paceType":1,"segments":[{"segmentId":115,"segmentName":"Jarvis FWD Climb","segmentVisits":4},{"segmentId":113,"segmentName":"Jarvis FWD Sprint","segmentVisits":4}],"eventDate":"2026-04-14T08:00:00Z","courseFull":"WATOPIA_The_Classic","courseName":"The Classic","raceFormat":"race","courseWorld":"WATOPIA","subgroup_label":"C","courseDifficulty":2,"lapAscentInMeters":48.448,"lapDistanceInMeters":4836,"leadinAscentInMeters":16.084,"leadinDistanceInMeters":4181}',4,'planned');
INSERT INTO "rounds" VALUES(8,1,'Race 3','2026-04-21T08:00:00Z','FRANCE','Croissant',NULL,'Scratch',9.3,49.29,NULL,NULL,'C','{"race":3,"tags":["zrl19","wtrl","zrl","zrl_arch","no_flagging","nobraking","new_race_results","starting_powerup=1","powerup_percent=\"0,33,1,33,5,34\"","timestamp=1773081202157","steering_disabled"],"rules":"SHOW_RACE_RESULTS;NO_TT_BIKES","duration":3,"paceType":1,"segments":[],"eventDate":"2026-04-21T08:00:00Z","courseFull":"FRANCE_Croissant","courseName":"Croissant","raceFormat":"scratch","courseWorld":"FRANCE","subgroup_label":"C","courseDifficulty":2,"lapAscentInMeters":49.29,"lapDistanceInMeters":9273,"leadinAscentInMeters":23.219,"leadinDistanceInMeters":3241}',3,'planned');
INSERT INTO "rounds" VALUES(9,1,'Race 4','2026-04-28T08:00:00Z','NEWYORK','Double Span Spin',NULL,'Scratch',7,79.972,NULL,NULL,'C','{"race":4,"tags":["wtrl","zrl","zrl19","zrl_arch","no_flagging","steering_disabled","nobraking","new_race_results","starting_powerup=5","arch_powerup=\"11,0,10,5\"","timestamp=1773081364519"],"rules":"NO_TT_BIKES;SHOW_RACE_RESULTS","duration":3,"paceType":1,"segments":[{"segmentId":130,"segmentName":"Manhattan REV Sprint","segmentVisits":4},{"segmentId":133,"segmentName":"Brooklyn Bridge FWD Climb","segmentVisits":3}],"eventDate":"2026-04-28T08:00:00Z","courseFull":"NEWYORK_Double_Span_Spin","courseName":"Double Span Spin","raceFormat":"race","courseWorld":"NEWYORK","subgroup_label":"C","courseDifficulty":4,"lapAscentInMeters":79.972,"lapDistanceInMeters":7018,"leadinAscentInMeters":39.754,"leadinDistanceInMeters":5567}',3,'planned');
CREATE TABLE teams (
    wtrl_team_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    division TEXT,
    division_number INTEGER,
    captain_id INTEGER REFERENCES athletes(zwid),
    club_id TEXT,
    tttid INTEGER,
    club_name TEXT,
    gender TEXT,
    league TEXT,
    zrldivision TEXT,
    league_color TEXT,
    rec INTEGER,
    status INTEGER,
    is_dev INTEGER,
    rounds TEXT,
    member_count INTEGER
, season_code TEXT);
INSERT INTO "teams" VALUES(74016,'Team INOX FIRE','C','Lime',2,NULL,'cef70cde-9149-43a2-b3ae-187643a44703',16604,'TEAM INOX','2','350','Lime','#BFFF00',0,1,0,'1,2,3,4',10,'zrl_25_26');
INSERT INTO "teams" VALUES(74930,'Team INOX Trinacria','B','Blue',0,NULL,'cef70cde-9149-43a2-b3ae-187643a44703',18013,'TEAM INOX','2','410','Blue','#0000FF',1,1,0,'1,2,3,4',4,'zrl_25_26');
INSERT INTO "teams" VALUES(75145,'Team INOX MADNESS','B','Emerald',1,NULL,'cef70cde-9149-43a2-b3ae-187643a44703',15021,'TEAM INOX','2','330','Emerald','#50C878',0,1,0,'1,2,3,4',9,'zrl_25_26');
INSERT INTO "teams" VALUES(75150,'Team INOX AAB','C','Shamrock',3,NULL,'cef70cde-9149-43a2-b3ae-187643a44703',13732,'TEAM INOX','2','370','Shamrock','#009E60',0,1,0,'1,2,3,4',12,'zrl_25_26');
INSERT INTO "teams" VALUES(75151,'TEAM INOX MONSTERS','C','Emerald',0,NULL,'cef70cde-9149-43a2-b3ae-187643a44703',16868,'TEAM INOX','2','330','Emerald','#50C878',0,1,0,'1,2,3,4',7,'zrl_25_26');
INSERT INTO "teams" VALUES(75258,'TEAM INOX LOL','D','Lime',0,NULL,'cef70cde-9149-43a2-b3ae-187643a44703',13973,'TEAM INOX','2','350','Lime','#BFFF00',0,1,0,'1,2,3,4',9,'zrl_25_26');
INSERT INTO "teams" VALUES(75570,'Team INOX TURTLES','D','Mint',0,NULL,'cef70cde-9149-43a2-b3ae-187643a44703',18235,'TEAM INOX','2','360','Mint','#98FF98',1,1,0,'1,2,3,4',4,'zrl_25_26');
CREATE TABLE results (
    round_id INTEGER REFERENCES rounds(id),
    zwid INTEGER REFERENCES athletes(zwid),
    time REAL,
    points_total INTEGER DEFAULT 0,
    data_source TEXT,
    points_finish INTEGER DEFAULT 0,
    points_fal INTEGER DEFAULT 0,
    points_fts INTEGER DEFAULT 0,
    position INTEGER
);
CREATE TABLE availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zwid INTEGER REFERENCES athletes(zwid),
    round_id INTEGER REFERENCES rounds(id),
    status TEXT DEFAULT 'available',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE league_times (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    start_time_utc TEXT NOT NULL,
    display_name TEXT NOT NULL,
    slot_order INTEGER
);
CREATE TABLE user_time_preferences (
    zwid INTEGER REFERENCES athletes(zwid),
    time_slot_id TEXT REFERENCES league_times(id),
    preference_level INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (zwid, time_slot_id)
);
CREATE TABLE inox_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    zwift_link TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    strava_segment_id TEXT
);
CREATE TABLE round_teams (
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams(wtrl_team_id),
    timeslot_id TEXT REFERENCES league_times(id),
    PRIMARY KEY (round_id, team_id)
);
CREATE TABLE race_lineup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams(wtrl_team_id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    role TEXT DEFAULT 'starter',
    status TEXT DEFAULT 'pending'
);
CREATE TABLE rounds_v2 (id INTEGER PRIMARY KEY AUTOINCREMENT, wtrl_id INTEGER, season_code TEXT, round_number INTEGER, name TEXT NOT NULL, starts_at TEXT, ends_at TEXT, sync_state TEXT DEFAULT 'PENDING', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "rounds_v2" VALUES(1,16,'zrl_25_26',1,'Round 1','2025-09-15','2025-10-06','CREATED','2026-05-27 10:08:30','2026-05-27 10:08:30');
INSERT INTO "rounds_v2" VALUES(2,17,'zrl_25_26',2,'Round 2','2025-11-03','2025-12-08','CREATED','2026-05-27 10:08:30','2026-05-27 10:08:30');
INSERT INTO "rounds_v2" VALUES(3,18,'zrl_25_26',3,'Round 3','2026-01-05','2026-02-09','CREATED','2026-05-27 10:08:30','2026-05-27 10:08:30');
INSERT INTO "rounds_v2" VALUES(4,19,'zrl_25_26',4,'Round 4','2026-04-07T08:00:00Z','2026-04-28T08:00:00Z','COMPLETED','2026-05-27 10:08:30','2026-05-27 19:01:15');
CREATE TABLE season_lifecycle_status (season_id INTEGER PRIMARY KEY, status TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "season_lifecycle_status" VALUES(19,'TEAMS_DONE','2026-05-27 20:02:24');
CREATE TABLE season_action_log (id TEXT PRIMARY KEY, action TEXT NOT NULL, season_id INTEGER NOT NULL, status TEXT NOT NULL, payload TEXT, import_id TEXT, sequence_number INTEGER, version INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "season_action_log" VALUES('58e9ba80-568c-48af-b8e3-87b9ae563f28','IMPORT_ROSTER',19,'failed','{"seasonId":19,"data":[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]}',NULL,NULL,1,'2026-05-27 20:06:06');
INSERT INTO "season_action_log" VALUES('661d1c35-eeb5-4324-b02a-195ebeba24f4','IMPORT_ROSTER',19,'failed','{"seasonId":19,"data":[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]}',NULL,NULL,1,'2026-05-27 20:07:49');
INSERT INTO "season_action_log" VALUES('1ec95fa5-ed13-4edc-be98-e17d0cb79a33','IMPORT_ROSTER',19,'failed','{"seasonId":19,"data":[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]}',NULL,NULL,1,'2026-05-27 20:09:53');
INSERT INTO "season_action_log" VALUES('58261da7-c7e3-4076-ba52-badaf0e82270','IMPORT_ROSTER',19,'success','{"seasonId":19,"data":[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]}','b01848a4-f2d2-4c78-a487-afcc94fea13d',1,1,'2026-05-27 20:12:44');
INSERT INTO "season_action_log" VALUES('cb2f6f20-43d1-4a5b-91b6-3db9f257cc6a','IMPORT_ROSTER',19,'success','{"seasonId":19,"data":[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]}','eeef188f-4fd4-41a2-b0ba-009e3d6ab233',2,1,'2026-05-27 20:17:49');
CREATE TABLE wtrl_import_locks (season_id INTEGER, type TEXT, import_id TEXT, PRIMARY KEY(season_id, type));
INSERT INTO "wtrl_import_locks" VALUES(19,'roster','eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
CREATE TABLE wtrl_import_state (import_id TEXT PRIMARY KEY, season_id INTEGER, type TEXT, status TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "wtrl_import_state" VALUES('903c5d56-9636-4670-90cc-bfff1429f6fe',19,'roster','failed','2026-05-27 20:06:06','2026-05-27 20:06:06');
INSERT INTO "wtrl_import_state" VALUES('ce71c416-5601-4cab-96af-f42dbe0b0a3c',19,'roster','pending_cleanup','2026-05-27 20:07:49','2026-05-27 20:07:48');
INSERT INTO "wtrl_import_state" VALUES('b01848a4-f2d2-4c78-a487-afcc94fea13d',19,'roster','pending_cleanup','2026-05-27 20:12:44','2026-05-27 20:12:44');
INSERT INTO "wtrl_import_state" VALUES('eeef188f-4fd4-41a2-b0ba-009e3d6ab233',19,'roster','pending_cleanup','2026-05-27 20:17:49','2026-05-27 20:17:49');
CREATE TABLE wtrl_import_logs (id TEXT PRIMARY KEY, type TEXT, season_id INTEGER, imported_count INTEGER, raw_snapshot TEXT, status TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "wtrl_import_logs" VALUES('ce71c416-5601-4cab-96af-f42dbe0b0a3c','roster',19,106,'[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]','completed','2026-05-27 20:07:49');
INSERT INTO "wtrl_import_logs" VALUES('b01848a4-f2d2-4c78-a487-afcc94fea13d','roster',19,106,'[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]','completed','2026-05-27 20:12:44');
INSERT INTO "wtrl_import_logs" VALUES('eeef188f-4fd4-41a2-b0ba-009e3d6ab233','roster',19,106,'[{"teamExternalId":13732,"riders":[{"wtrlId":439957,"name":"Alessio Nisini","category":"C"},{"wtrlId":456341,"name":"Andy Jones","category":"C"},{"wtrlId":439951,"name":"Fabio Bertoldi","category":"C"},{"wtrlId":455910,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439953,"name":"Luca Adamo","category":"C"},{"wtrlId":455766,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439955,"name":"claudio ubertini","category":"C"},{"wtrlId":439956,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455944,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455773,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439949,"name":"Nicola Mancini","category":"C"},{"wtrlId":455422,"name":"Viciu Pacciu","category":"C"}]},{"teamExternalId":13704,"riders":[{"wtrlId":456218,"name":"Cristian Collesei","category":"B"},{"wtrlId":439877,"name":"Giulio Strazzulla","category":"B"},{"wtrlId":439876,"name":"giuseppe durante","category":"B"},{"wtrlId":456442,"name":"luca briccoli","category":"B"},{"wtrlId":439871,"name":"Luigi Buso","category":"B"},{"wtrlId":439873,"name":"Roberto Pegoraro","category":"B"},{"wtrlId":439879,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":439874,"name":"Massimiliano Caccia","category":"B"},{"wtrlId":455916,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":439868,"name":"Miky Tedesco","category":"B"},{"wtrlId":439870,"name":"Gianmarco Donetti","category":"B"},{"wtrlId":456443,"name":"Pierpaolo Varvazzo","category":"B"}]},{"teamExternalId":14386,"riders":[{"wtrlId":441665,"name":"Andrea Cerri [INOX]","category":"Aplus"}]},{"teamExternalId":16604,"riders":[{"wtrlId":444173,"name":"Chris Musgrove","category":"C"},{"wtrlId":444179,"name":"Cristian Pelosi","category":"C"},{"wtrlId":455366,"name":"Francesco Ravasi","category":"C"},{"wtrlId":444171,"name":"Roberto Baroni","category":"C"},{"wtrlId":444181,"name":"umberto dianzani","category":"C"},{"wtrlId":444174,"name":"Vincenzo Larocca","category":"C"},{"wtrlId":444177,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":455436,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":444178,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":444172,"name":"Maximilian Mione","category":"C"},{"wtrlId":444180,"name":"Claudio Varani","category":"C"}]},{"teamExternalId":13973,"riders":[{"wtrlId":440483,"name":"Andrea Castori","category":"D"},{"wtrlId":440480,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":440481,"name":"David Grosso","category":"D"},{"wtrlId":454855,"name":"Mauro Nana","category":"D"},{"wtrlId":440479,"name":"Paulin Z. CJ TT1D","category":"D"},{"wtrlId":440482,"name":"Roberto Regno","category":"D"},{"wtrlId":455520,"name":"Cristian Bonafé","category":"D"},{"wtrlId":440486,"name":"Dario Paparella","category":"D"},{"wtrlId":440485,"name":"Graziano Gabrieli","category":"D"},{"wtrlId":440477,"name":"Raffaele Santoni","category":"D"},{"wtrlId":440478,"name":"manuel magnotti","category":"D"}]},{"teamExternalId":15021,"riders":[{"wtrlId":442616,"name":"Anthony Howard","category":"B"},{"wtrlId":442620,"name":"Antonio Bove","category":"B"},{"wtrlId":442618,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":456384,"name":"Luca Bille","category":"B"},{"wtrlId":455410,"name":"Mik D''andrea","category":"B"},{"wtrlId":442617,"name":"Andy Jones","category":"C"},{"wtrlId":442621,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":455172,"name":"Paolo Spadaro","category":"C"},{"wtrlId":455396,"name":"Simone Oppezzo","category":"C"},{"wtrlId":442622,"name":"Gaetano Lo verde","category":"B"}]},{"teamExternalId":16868,"riders":[{"wtrlId":444852,"name":"Cesare Pisacane","category":"C"},{"wtrlId":455314,"name":"Diego Burattini","category":"C"},{"wtrlId":444846,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":444845,"name":"Roberto Sanna","category":"C"},{"wtrlId":444848,"name":"Sandro Giusti","category":"C"},{"wtrlId":455754,"name":"Thomas Fischer","category":"C"},{"wtrlId":444849,"name":"Davide Bertin","category":"C"},{"wtrlId":444847,"name":"Salvatore Matarazzo","category":"C"},{"wtrlId":455442,"name":"Chris Musgrove","category":"C"},{"wtrlId":444850,"name":"Michele Puri","category":"C"}]},{"teamExternalId":14596,"riders":[]},{"teamExternalId":13730,"riders":[{"wtrlId":439945,"name":"claudio ubertini","category":"C"},{"wtrlId":439940,"name":"Luca Adamo","category":"C"},{"wtrlId":439946,"name":"Luca SAMPAOLESI","category":"C"},{"wtrlId":439942,"name":"Marco Esposito [INOX]","category":"C"},{"wtrlId":439948,"name":"umberto dianzani","category":"C"},{"wtrlId":439944,"name":"Viciu Pacciu","category":"C"},{"wtrlId":439939,"name":"Claudio Varani","category":"C"},{"wtrlId":439947,"name":"Fabio Ghislotti [INOX]","category":"C"},{"wtrlId":439937,"name":"Francesco Ravasi","category":"C"},{"wtrlId":439938,"name":"Giancarlo Rugolo","category":"C"},{"wtrlId":439943,"name":"Michael Kirscht INOX","category":"C"},{"wtrlId":439941,"name":"Thomas Fischer","category":"C"}]},{"teamExternalId":18013,"riders":[{"wtrlId":447421,"name":"Loris Van de kassteele","category":"B"},{"wtrlId":447419,"name":"luca briccoli","category":"B"},{"wtrlId":447416,"name":"Mario Cavallaro","category":"B"},{"wtrlId":447413,"name":"Miky Tedesco","category":"B"},{"wtrlId":455169,"name":"Paolo Spadaro","category":"C"},{"wtrlId":447420,"name":"Pierpaolo Varvazzo","category":"B"},{"wtrlId":447412,"name":"Ricardo Santos","category":"B"},{"wtrlId":456178,"name":"Cristian Collesei","category":"B"},{"wtrlId":456195,"name":"Luca Bille","category":"B"},{"wtrlId":447422,"name":"giuseppe durante","category":"B"}]},{"teamExternalId":18235,"riders":[{"wtrlId":448523,"name":"Andrea Castori","category":"D"},{"wtrlId":448520,"name":"Claudio Fioravanti","category":"D"},{"wtrlId":448516,"name":"Raffaele Santoni","category":"D"},{"wtrlId":448522,"name":"Roberto Regno","category":"D"},{"wtrlId":448524,"name":"Alberto Ianiro","category":"D"},{"wtrlId":448521,"name":"David Grosso","category":"D"},{"wtrlId":448525,"name":"Giovanni Cingolani","category":"D"},{"wtrlId":448518,"name":"manuel magnotti","category":"D"},{"wtrlId":448517,"name":"Paolo Pellegrini","category":"D"},{"wtrlId":448519,"name":"Paulin Z. CJ TT1D","category":"D"}]},{"teamExternalId":17159,"riders":[{"wtrlId":445225,"name":"Diego Burattini","category":"C"},{"wtrlId":445231,"name":"Luca Durighel [INOX]","category":"B"},{"wtrlId":445230,"name":"Massimo Spagnoli","category":"B"},{"wtrlId":445227,"name":"Matteo Fumagalli","category":"B"},{"wtrlId":445233,"name":"Federico Garavaglia","category":"B"},{"wtrlId":445232,"name":"Oz Onder","category":"C"},{"wtrlId":445229,"name":"Simone Oppezzo","category":"C"}]}]','completed','2026-05-27 20:17:49');
CREATE TABLE team_members (athlete_id INTEGER, wtrl_rider_id INTEGER, team_id INTEGER, season_id TEXT, name TEXT, category TEXT, is_active INTEGER DEFAULT 1, last_import_id TEXT, PRIMARY KEY(athlete_id, team_id, season_id));
INSERT INTO "team_members" VALUES(439957,439957,75150,'19','Alessio Nisini','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(456341,456341,75150,'19','Andy Jones','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439951,439951,75150,'19','Fabio Bertoldi','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455910,455910,75150,'19','Francesco Ravasi','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439953,439953,75150,'19','Luca Adamo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455766,455766,75150,'19','Luca SAMPAOLESI','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439955,439955,75150,'19','claudio ubertini','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439956,439956,75150,'19','Cristian Pelosi','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455944,455944,75150,'19','Giancarlo Rugolo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455773,455773,75150,'19','Marco Esposito [INOX]','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439949,439949,75150,'19','Nicola Mancini','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455422,455422,75150,'19','Viciu Pacciu','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(456218,456218,13704,'19','Cristian Collesei','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439877,439877,13704,'19','Giulio Strazzulla','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439876,439876,13704,'19','giuseppe durante','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(456442,456442,13704,'19','luca briccoli','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439871,439871,13704,'19','Luigi Buso','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439873,439873,13704,'19','Roberto Pegoraro','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439879,439879,13704,'19','Luca Durighel [INOX]','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439874,439874,13704,'19','Massimiliano Caccia','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455916,455916,13704,'19','Matteo Fumagalli','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439868,439868,13704,'19','Miky Tedesco','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439870,439870,13704,'19','Gianmarco Donetti','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(456443,456443,13704,'19','Pierpaolo Varvazzo','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(441665,441665,14386,'19','Andrea Cerri [INOX]','Aplus',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444173,444173,74016,'19','Chris Musgrove','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444179,444179,74016,'19','Cristian Pelosi','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455366,455366,74016,'19','Francesco Ravasi','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444171,444171,74016,'19','Roberto Baroni','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444181,444181,74016,'19','umberto dianzani','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444174,444174,74016,'19','Vincenzo Larocca','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444177,444177,74016,'19','Giancarlo Rugolo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455436,455436,74016,'19','Luca SAMPAOLESI','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444178,444178,74016,'19','Marco Esposito [INOX]','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444172,444172,74016,'19','Maximilian Mione','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444180,444180,74016,'19','Claudio Varani','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440483,440483,75258,'19','Andrea Castori','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440480,440480,75258,'19','Claudio Fioravanti','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440481,440481,75258,'19','David Grosso','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(454855,454855,75258,'19','Mauro Nana','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440479,440479,75258,'19','Paulin Z. CJ TT1D','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440482,440482,75258,'19','Roberto Regno','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455520,455520,75258,'19','Cristian Bonafé','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440486,440486,75258,'19','Dario Paparella','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440485,440485,75258,'19','Graziano Gabrieli','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440477,440477,75258,'19','Raffaele Santoni','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(440478,440478,75258,'19','manuel magnotti','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(442616,442616,75145,'19','Anthony Howard','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(442620,442620,75145,'19','Antonio Bove','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(442618,442618,75145,'19','Luca Durighel [INOX]','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(456384,456384,75145,'19','Luca Bille','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455410,455410,75145,'19','Mik D''andrea','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(442617,442617,75145,'19','Andy Jones','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(442621,442621,75145,'19','Massimo Spagnoli','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455172,455172,75145,'19','Paolo Spadaro','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455396,455396,75145,'19','Simone Oppezzo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(442622,442622,75145,'19','Gaetano Lo verde','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444852,444852,75151,'19','Cesare Pisacane','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455314,455314,75151,'19','Diego Burattini','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444846,444846,75151,'19','Michael Kirscht INOX','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444845,444845,75151,'19','Roberto Sanna','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444848,444848,75151,'19','Sandro Giusti','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455754,455754,75151,'19','Thomas Fischer','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444849,444849,75151,'19','Davide Bertin','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444847,444847,75151,'19','Salvatore Matarazzo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455442,455442,75151,'19','Chris Musgrove','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(444850,444850,75151,'19','Michele Puri','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439945,439945,13730,'19','claudio ubertini','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439940,439940,13730,'19','Luca Adamo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439946,439946,13730,'19','Luca SAMPAOLESI','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439942,439942,13730,'19','Marco Esposito [INOX]','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439948,439948,13730,'19','umberto dianzani','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439944,439944,13730,'19','Viciu Pacciu','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439939,439939,13730,'19','Claudio Varani','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439947,439947,13730,'19','Fabio Ghislotti [INOX]','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439937,439937,13730,'19','Francesco Ravasi','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439938,439938,13730,'19','Giancarlo Rugolo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439943,439943,13730,'19','Michael Kirscht INOX','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(439941,439941,13730,'19','Thomas Fischer','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(447421,447421,74930,'19','Loris Van de kassteele','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(447419,447419,74930,'19','luca briccoli','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(447416,447416,74930,'19','Mario Cavallaro','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(447413,447413,74930,'19','Miky Tedesco','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(455169,455169,74930,'19','Paolo Spadaro','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(447420,447420,74930,'19','Pierpaolo Varvazzo','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(447412,447412,74930,'19','Ricardo Santos','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(456178,456178,74930,'19','Cristian Collesei','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(456195,456195,74930,'19','Luca Bille','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(447422,447422,74930,'19','giuseppe durante','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448523,448523,75570,'19','Andrea Castori','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448520,448520,75570,'19','Claudio Fioravanti','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448516,448516,75570,'19','Raffaele Santoni','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448522,448522,75570,'19','Roberto Regno','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448524,448524,75570,'19','Alberto Ianiro','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448521,448521,75570,'19','David Grosso','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448525,448525,75570,'19','Giovanni Cingolani','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448518,448518,75570,'19','manuel magnotti','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448517,448517,75570,'19','Paolo Pellegrini','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(448519,448519,75570,'19','Paulin Z. CJ TT1D','D',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(445225,445225,17159,'19','Diego Burattini','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(445231,445231,17159,'19','Luca Durighel [INOX]','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(445230,445230,17159,'19','Massimo Spagnoli','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(445227,445227,17159,'19','Matteo Fumagalli','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(445233,445233,17159,'19','Federico Garavaglia','B',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(445232,445232,17159,'19','Oz Onder','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
INSERT INTO "team_members" VALUES(445229,445229,17159,'19','Simone Oppezzo','C',1,'eeef188f-4fd4-41a2-b0ba-009e3d6ab233');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',1);
INSERT INTO "sqlite_sequence" VALUES('series',1);
INSERT INTO "sqlite_sequence" VALUES('rounds_v2',4);
INSERT INTO "sqlite_sequence" VALUES('rounds',9);
CREATE INDEX idx_round_groups_series ON zrl_round_groups(series_id);
CREATE INDEX idx_races_round_group ON zrl_races(zrl_round_group_id);
CREATE INDEX idx_team_standings_round ON zrl_team_standings(round_group_id);
CREATE INDEX idx_division_results_round ON division_results(round_id);
CREATE INDEX idx_events_season_seq ON zrl_season_events(season_id, sequence_number);
CREATE INDEX idx_events_trace ON zrl_season_events(trace_id);
CREATE INDEX idx_locks_owner ON zrl_orchestrator_locks(owner_token);
CREATE VIEW seasons AS SELECT id, 'zrl_25_26' AS code, name FROM zrl_seasons;