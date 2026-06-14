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
  Sparkles
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
  alert?: (data: any) => string | null;
}

export const DASHBOARD_CONFIG: DashboardCardConfig[] = [
  // ZRL PRIMARY COMMAND (Unified Hub)
  {
    id: 'zrl-command',
    title: "ZRL Command Center",
    subtitle: "Mission Control",
    desc: "Gestione integrale ZRL: configurazione round, roster strategy, lineup e risultati ufficiali.",
    icon: LayoutGrid,
    path: "/zrl-operations",
    color: "from-orange-500 to-red-600",
    size: "lg",
    permission: 'zrl.lineup'
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
    permission: 'ai.narrative'
  },
  // ZRL MODULES (For all roles)
  {
    id: 'zrl-questionnaire',
    title: "Questionario",
    subtitle: "Round RSVP",
    desc: "Conferma la tua disponibilità per i prossimi round ZRL.",
    icon: ClipboardCheck,
    path: "/availability",
    color: "from-blue-400 to-indigo-500",
    size: "md",
    permission: 'questionnaire.view'
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
    permission: 'wt.view'
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
    permission: 'events.view'
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
    permission: 'admin.system'
  }
];


