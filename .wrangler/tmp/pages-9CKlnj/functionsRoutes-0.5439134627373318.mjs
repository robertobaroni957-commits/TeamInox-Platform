import { onRequestPost as __api_admin_delete_user_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\admin\\delete_user.js"
import { onRequestPost as __api_admin_import_csv_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\admin\\import-csv.js"
import { onRequestPost as __api_admin_init_season_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\admin\\init-season.js"
import { onRequestGet as __api_admin_list_users_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\admin\\list_users.js"
import { onRequestGet as __api_admin_roster_suggestions_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\admin\\roster-suggestions.js"
import { onRequestPost as __api_admin_update_role_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\admin\\update_role.js"
import { onRequestGet as __api_availability_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\availability.js"
import { onRequestPost as __api_availability_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\availability.js"
import { onRequestGet as __api_availability_check_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\availability-check.js"
import { onRequestGet as __api_create_admin_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\create-admin.js"
import { onRequestGet as __api_events_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\events.js"
import { onRequestGet as __api_lineup_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\lineup.js"
import { onRequestPost as __api_login_auth_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\login_auth.js"
import { onRequestPost as __api_register_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\register.js"
import { onRequestGet as __api_results_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\results.js"
import { onRequestGet as __api_roster_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\roster.js"
import { onRequestPost as __api_roster_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\roster.js"
import { onRequestPost as __api_round_init_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\round-init.js"
import { onRequestPost as __api_round_reset_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\round-reset.js"
import { onRequestGet as __api_round_status_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\round-status.js"
import { onRequestGet as __api_rounds_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\rounds.js"
import { onRequestGet as __api_series_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\series.js"
import { onRequestPatch as __api_series_js_onRequestPatch } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\series.js"
import { onRequestPost as __api_series_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\series.js"
import { onRequestGet as __api_setup_zrl_2026_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\setup-zrl-2026.js"
import { onRequestPost as __api_sync_all_teams_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\sync-all-teams.js"
import { onRequestPost as __api_sync_rounds_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\sync-rounds.js"
import { onRequestGet as __api_sync_schedule_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\sync-schedule.js"
import { onRequestPost as __api_sync_wtrl_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\sync-wtrl.js"
import { onRequestGet as __api_teams_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\functions\\api\\teams.js"
import { onRequest as ___middleware_js_onRequest } from "C:\\Progetti\\InoxTeam Platform\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/admin/delete_user",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_delete_user_js_onRequestPost],
    },
  {
      routePath: "/api/admin/import-csv",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_import_csv_js_onRequestPost],
    },
  {
      routePath: "/api/admin/init-season",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_init_season_js_onRequestPost],
    },
  {
      routePath: "/api/admin/list_users",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_list_users_js_onRequestGet],
    },
  {
      routePath: "/api/admin/roster-suggestions",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_roster_suggestions_js_onRequestGet],
    },
  {
      routePath: "/api/admin/update_role",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_update_role_js_onRequestPost],
    },
  {
      routePath: "/api/availability",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_availability_js_onRequestGet],
    },
  {
      routePath: "/api/availability",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_availability_js_onRequestPost],
    },
  {
      routePath: "/api/availability-check",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_availability_check_js_onRequestGet],
    },
  {
      routePath: "/api/create-admin",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_create_admin_js_onRequestGet],
    },
  {
      routePath: "/api/events",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_events_js_onRequestGet],
    },
  {
      routePath: "/api/lineup",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_lineup_js_onRequestGet],
    },
  {
      routePath: "/api/login_auth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_auth_js_onRequestPost],
    },
  {
      routePath: "/api/register",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_register_js_onRequestPost],
    },
  {
      routePath: "/api/results",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_results_js_onRequestGet],
    },
  {
      routePath: "/api/roster",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_roster_js_onRequestGet],
    },
  {
      routePath: "/api/roster",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_roster_js_onRequestPost],
    },
  {
      routePath: "/api/round-init",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_round_init_js_onRequestPost],
    },
  {
      routePath: "/api/round-reset",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_round_reset_js_onRequestPost],
    },
  {
      routePath: "/api/round-status",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_round_status_js_onRequestGet],
    },
  {
      routePath: "/api/rounds",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_rounds_js_onRequestGet],
    },
  {
      routePath: "/api/series",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_series_js_onRequestGet],
    },
  {
      routePath: "/api/series",
      mountPath: "/api",
      method: "PATCH",
      middlewares: [],
      modules: [__api_series_js_onRequestPatch],
    },
  {
      routePath: "/api/series",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_series_js_onRequestPost],
    },
  {
      routePath: "/api/setup-zrl-2026",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_setup_zrl_2026_js_onRequestGet],
    },
  {
      routePath: "/api/sync-all-teams",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_sync_all_teams_js_onRequestPost],
    },
  {
      routePath: "/api/sync-rounds",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_sync_rounds_js_onRequestPost],
    },
  {
      routePath: "/api/sync-schedule",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_sync_schedule_js_onRequestGet],
    },
  {
      routePath: "/api/sync-wtrl",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_sync_wtrl_js_onRequestPost],
    },
  {
      routePath: "/api/teams",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_teams_js_onRequestGet],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]