import { onRequestGet as __api_admin_list_users_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\admin\\list_users.js"
import { onRequestPost as __api_admin_update_role_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\admin\\update_role.js"
import { onRequestGet as __api_create_admin_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\create-admin.js"
import { onRequestPost as __api_login_auth_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\login_auth.js"
import { onRequestPost as __api_register_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\register.js"
import { onRequestPost as __api_sync_all_teams_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\sync-all-teams.js"
import { onRequestPost as __api_sync_rounds_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\sync-rounds.js"
import { onRequestPost as __api_sync_wtrl_js_onRequestPost } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\sync-wtrl.js"
import { onRequestGet as __api_teams_js_onRequestGet } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\teams.js"
import { onRequest as __api_availability_js_onRequest } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\api\\availability.js"
import { onRequest as ___middleware_js_onRequest } from "C:\\Progetti\\InoxTeam Platform\\TeamInox-Platform\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/admin/list_users",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_list_users_js_onRequestGet],
    },
  {
      routePath: "/api/admin/update_role",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_update_role_js_onRequestPost],
    },
  {
      routePath: "/api/create-admin",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_create_admin_js_onRequestGet],
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
      routePath: "/api/availability",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_availability_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]