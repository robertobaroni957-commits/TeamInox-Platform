import { 
  Zap, 
  Calendar, 
  Star, 
  Users, 
  LayoutGrid, 
  ClipboardCheck,
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
  adminOnly?: boolean;
}

export const DASHBOARD_CONFIG: DashboardCardConfig[] = [
  // ZRL COMMAND CENTER — admin/moderator
  {
    id: 'zrl-command',
    title: "ZRL Command Center",
    subtitle: "Mission Control",
    desc: "Gestione integrale ZRL: configurazione round, roster strategy, lineup e risultati ufficiali.",
    icon: LayoutGrid,
    path: "/zrl-operations",
    color: "from-orange-500 to-red-600",
    size: "lg",
    permission: 'zrl.manage',
    adminOnly: true,
  },
  // ZRL HUB — captain/user/athlete
  {
    id: 'zrl-hub',
    title: "ZRL Hub",
    subtitle: "Zona Gare",
    desc: "Questionario sempre disponibile e accesso ai moduli ZRL per chi è nei roster ufficiali WTRL.",
    icon: Zap,
    path: "/zrl-operations",
    color: "from-orange-500 to-red-600",
    size: "lg",
    permission: 'questionnaire.view',
    adminOnly: false,
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
  },
  // WINTER TOUR
  {
    id: 'winter-tour',
    title: "Winter Tour Hub",
    subtitle: "Campionato Interno",
    desc: "Classifiche, tappe e gestione del tour invernale InoxTeam.",
    icon: Star,
    path: "/winter-tour",
    color: "from-yellow-400 to-orange-500",
    size: "md",
    permission: 'wt.view',
  },
  // EVENTS
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
  },
  // ADMIN
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
  }
];
