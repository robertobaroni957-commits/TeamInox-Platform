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
  Settings
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
    id: 'events',
    title: "Events",
    subtitle: "Calendario Sociale",
    desc: "Allenamenti, corse di gruppo e appuntamenti settimanali.",
    icon: Calendar,
    path: "/events",
    color: "from-emerald-500 to-teal-600",
    size: "sm",
    permission: 'events.view'
  },
  {
    id: 'events-manage',
    title: "Events Lab",
    subtitle: "Configuration",
    desc: "Gestione calendario corse sociali e allenamenti di gruppo.",
    icon: LayoutGrid,
    path: "/admin/events",
    color: "from-emerald-600 to-teal-700",
    size: "sm",
    permission: 'events.manage'
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


