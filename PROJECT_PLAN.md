# INOXTEAM PLATFORM - DETAILED PROJECT PLAN

## 1. STRATEGIC GOALS
- **Centralized Administration:** Unified dashboard for ZRL, Winter Tour, and Inox Events.
- **Automated Workflows:** Sync from WTRL, results processing, Discord notifications.
- **Live Performance:** Integration with Strava for real-time segment/event tracking.

---

## 2. ZRL MANAGEMENT (High Priority)
| Task | Status | Action Needed |
| :--- | :---: | :--- |
| **Availability (RSVP)** | 🟢 | Done. Matrix visible in Admin. |
| **RSVP Reminders** | 🔴 | Add Discord Webhook to nudge missing athletes. |
| **Roster Sync** | 🟢 | Done via Script/JSON import. |
| **Lineup Builder** | 🟢 | Done. Integrated with RSVP. |
| **Lineup Announcement** | 🔴 | Add "Post to Discord" button in Roster Builder. |
| **Result Ingestion** | 🔴 | Implement `api/admin/sync-results.js` for WTRL API. |
| **Race Bulletin** | 🔴 | Create frontend reporter for results/standings. |

---

## 3. MASTER WINTER TOUR (Internal League)
| Task | Status | Action Needed |
| :--- | :---: | :--- |
| **Ruleset Config** | 🔴 | UI to define points (1st=100, 2nd=95, etc.). |
| **Round Management** | 🔴 | CRUD for Winter Tour stages in database. |
| **Result Entry** | 🔴 | Automated fetching from ZwiftPower/Strava. |
| **League Table** | 🟡 | Placeholder exists. Need logic for points sum. |
| **Hall of Fame** | 🔴 | Store previous season winners in `series` archive. |

---

## 4. INOX EVENTS & STRAVA INTEGRATION
| Task | Status | Action Needed |
| :--- | :---: | :--- |
| **Event Calendar** | 🟢 | Done. Populated with 17 weekly events. |
| **Strava OAuth** | 🔴 | Implementation of Strava authentication for riders. |
| **Live Timing API** | 🔴 | Webhook/Poller to fetch Strava segment efforts. |
| **Leaderboard** | 🔴 | Ranking based on Strava data for specific event times. |

---

## 5. UI/UX REORGANIZATION
| Task | Status | Action Needed |
| :--- | :---: | :--- |
| **Sidebar** | 🟢 | Categorized into Hub, Leagues, and Admin. |
| **Command Center** | 🟢 | Central hub for administrative tasks. |
| **Event Creation** | 🟡 | Exists for Inox Events. Need for Leagues. |

---

## 6. TECHNICAL DEBT & INFRASTRUCTURE
- [ ] **Cookie Management:** Improve WTRL session handling.
- [ ] **Discord Webhooks:** Centralized service for sending notifications.
- [ ] **Database Schema:** Add `winter_tour_points` and `strava_sync_logs` tables.

*Last Updated: 2026-04-30*
