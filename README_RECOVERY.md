# InoxTeam Platform - Recovery Guide

## Avvio del Progetto
1. `npm install`
2. Configura `.env` (usa `.env.example` come template).
3. `npx wrangler dev`

## Database & Migrazioni
- **Ripristino DB locale:** Utilizzare le migrazioni in `/migrations`.
- **Eseguire Migrazioni:** `npx wrangler d1 migrations apply <DB_NAME>`
- **Rollback:** `npx wrangler d1 migrations rollback <DB_NAME>`

## Architettura Round/Race
- **round_id:** Identificativo univoco di un round (es. "ZRL_2026_01").
- **race_id:** Identificativo univoco di una singola gara all'interno di un round (es. "ZRL_2026_01_A").
- **ActiveRoundContext:** Fonte di verità globale per il round corrente.
- **RaceSelector:** Responsabile della deduplicazione degli eventi WTRL A/B e C/D.

## Regole Architetturali
- Non caricare mai i round con `rounds[0]`.
- Il `lineup` è *race-centric*.
- Il `round selector` è vietato nel `LineupBuilder`.
