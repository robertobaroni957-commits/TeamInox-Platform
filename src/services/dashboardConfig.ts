import { 
  Trophy, 
  Zap, 
  Calendar, 
  Star, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Crosshair, 
  LayoutGrid, 
  Database,
  Shield,
  Activity,
  ClipboardCheck,
  Settings,
  Sparkles,
  ListOrdered
} from 'lucide-react';
import type { Permission } from './permissions';

export interface DashboardCardConfig {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: any;
  path: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
  permission: Permission;
  section?: 'zrl' | 'general';
  alert?: (data: any) => string | null;
}

export const DASHBOARD_CONFIG: DashboardCardConfig[] = [
  // ZRL PRIMARY COMMAND (Unified Hub) — admin/moderator only
  {
    id: 'zrl-command',
    title: "ZRL Command Center",
    subtitle: "Mission Control",
    desc: "Gestione integrale ZRL: configurazione round, roster strategy, lineup e risultati ufficiali.",
    icon: LayoutGrid,
    path: "/zrl-operations",
    color: "from-orange-500 to-red-600",
    size: "lg",
    permission: 'zrl.lineup',
    section: 'general'
  },
  // AI NARRATIVE
  {
    id: 'ai-narrative',
    title: "AI Narrative",
    subtitle: "Storyteller Layer",
    desc: "Genera report e insight basati sui dati sportivi ufficiali.",
    icon: Sparkles,
    path: "/ai/narrative",
    color: "from-purple-500 to-indigo-600",
    size: "md",
    permission: 'ai.narrative',
    section: 'general'
  },
  // ZRL HUB — Questionario
  {
    id: 'zrl-questionnaire',
    title: "Questionario",
    subtitle: "Round RSVP",
    desc: "Conferma la tua disponibilità per i prossimi round ZRL.",
    icon: ClipboardCheck,
    path: "/availability",
    color: "from-blue-400 to-indigo-500",
    size: "md",
    permission: 'questionnaire.view',
    section: 'zrl'
  },
  // ZRL HUB — Lineup
  {
    id: 'zrl-lineup',
    title: "Lineup di Gara",
    subtitle: "Composizione Squadra",
    desc: "Componi e gestisci la lineup per le gare ZRL della tua squadra.",
    icon: Crosshair,
    path: "/lineup",
    color: "from-orange-400 to-red-500",
    size: "md",
    permission: 'zrl.lineup',
    section: 'zrl'
  },
  // ZRL HUB — Risultati/Classifiche
  {
    id: 'zrl-results',
    title: "Classifiche ZRL",
    subtitle: "Division Results",
    desc: "Visualizza i risultati e le classifiche dei round ZRL.",
    icon: ListOrdered,
    path: "/zrl-results",
    color: "from-emerald-400 to-teal-500",
    size: "md",
    permission: 'zrl.results',
    section: 'zrl'
  },
  // WINTER TOUR
  {
    id: 'winter-tour',
    title: "Winter Tour Hub",
    subtitle: "Campionato Interno",
    desc: "Classifiche, tappe e gestione del tour invernale InoxTeam.",
    icon: Star,
    path: "/ranking",
    color: "from-yellow-400 to-orange-500",
    size: "md",
    permission: 'wt.view',
    section: 'general'
  },
  // SOCIAL / EVENTS
  {
    id: 'events-center',
    title: "Events Center",
    subtitle: "Calendario & Gestione",
    desc: "Calendario sociale e configurazione eventi unificata.",
    icon: Calendar,
    path: "/events",
    color: "from-emerald-500 to-teal-700",
    size: "sm",
    permission: 'events.view',
    section: 'general'
  },
  // ADMIN / SYSTEM
  {
    id: 'athlete-db',
    title: "Athlete DB",
    subtitle: "Rider Database",
    desc: "Anagrafica centrale, permessi e integrità dati atleti.",
    icon: Users,
    path: "/admin/users",
    color: "from-blue-500 to-indigo-600",
    size: "md",
    permission: 'admin.system',
    section: 'general'
  }
];
