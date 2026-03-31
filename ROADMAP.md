# 🏁 Inoxteam Platform 2026 - Roadmap

Progetto di riprogettazione del portale Inoxteam: da sito statico a Hub di gestione Team, Gare e Social.

---

## 🏗️ Fase 1: Fondamenta & Infrastruttura (COMPLETATA)
- [x] Inizializzazione progetto React + TypeScript + Vite.
- [x] Configurazione Tailwind CSS per design moderno/dark mode.
- [x] Definizione Schema SQL universale per Cloudflare D1.
- [x] Creazione Layout Globale (Sidebar responsiva, Header, Theme).
- [x] Setup React Router per la navigazione tra le sezioni.

## 🏎️ Fase 2: Racing Engine (IN CORSO)
- [x] Sviluppo API Worker per ricezione dati Live da Sauce4Zwift/Zenmaster.
- [x] Visualizzazione Classifiche Dinamiche (Interattive, filtrate per categoria).
- [x] Archivio Stagione Master Winter Tour 2025/26.
- [x] Inizializzazione Calendario ZRL Spring 2026.
- [x] Supporto TTT: Logica tempo sul 4° classificato implementata.
- [ ] Sistema di Ingestione ZwiftPower (JSON/API).

## 📋 Fase 3: Logistica Team (ZRL, DRS, Ladder) - IN CORSO
- [x] Gestione Multi-Team (Supporto per 20+ squadre simultanee).
- [x] Sistema RSVP/Disponibilità: gli atleti segnano la presenza per i Round.
- [x] **Roster Builder per Capitani:** Interfaccia per comporre le squadre velocemente.
- [x] Validazione Team: Limite 4-6 atleti per gara (Regolamento ZRL).
- [ ] Verifica automatica categorie e watt/kg per evitare squalifiche.
- [ ] Verifica automatica categorie e watt/kg per evitare squalifiche.
- [ ] Dashboard di Riepilogo Risultati per tutte le squadre del club.

## 📱 Fase 4: Social & Community
- [ ] Blog/News CMS: Sistema per scrivere Race Report e iniziative del team.
- [ ] **Athlete Profile:** Pagina personale per ogni atleta con storico gare e statistiche.
- [ ] Integrazioni Social (Discord Webhooks, Strava Club data, YouTube Embed).
- [ ] Medagliere e Hall of Fame del team.

## 🔐 Fase 5: Admin & Security
- [ ] Autenticazione sicura (JWT) con ruoli (Admin, Capitano, Atleta).
- [ ] Strumenti di scheduling per le prossime stagioni.
- [ ] Validazione dati e protezione da modifiche non autorizzate.

---

## 🛠️ Tecnologie Scelte
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Cloudflare Workers (Node.js/JS).
- **Database:** Cloudflare D1 (SQL/SQLite).
- **Integrazioni:** Sauce4Zwift API, ZwiftPower API.

---

## 🎯 Obiettivo Finale: Settembre 2026
Lancio della piattaforma completa per l'inizio della nuova stagione agonistica.
