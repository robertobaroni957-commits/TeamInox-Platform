import React, { useState } from 'react';
import { 
  Settings, Users, RefreshCw, Zap, ClipboardCheck, 
  Trophy, ChevronRight, AlertCircle, Calendar, CheckCircle2,
  Trash2, Plus, Save, Activity, TrendingUp,
  LayoutGrid, BarChart3, Brain, Flag, Map as MapIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useZRLReality } from '../../services/ZRLRealityProvider';
import AdminTutorPanel from '../../components/admin/AdminTutorPanel';
import { RoundControlProvider } from './RoundControlContext';

// Importazione componenti per gli step
import AvailabilityManagement from './AvailabilityManagement';
import RosterSuggestions from './RosterSuggestions';
import RosterBuilder from '../RosterBuilder';
import ZRLDivisionResults from '../ZRLDivisionResults';
import ZRLAnalytics from '../ZRLAnalytics';
import ZRLSeasonStats from '../ZRLSeasonStats';
import TeamsPage from '../TeamsPage';

interface RoundInput {
  id?: number;
  name: string;
  date: string;
  world: string;
  route: string;
  format: string;
  distance: number;
  elevation: number;
  category: string;
  powerups?: string;
}

const ZRLOperations: React.FC = () => {
  const navigate = useNavigate();
  const { seasons, teams: teamsData, mutate, isLoading, isError } = useZRLReality();
  const [activeStep, setActiveStep] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const activeSeason = (seasons && Array.isArray(seasons.data)) 
    ? seasons.data.find((s: any) => s.is_active) 
    : null;

  const handleSyncResults = async (file: File) => {
    setActionLoading(true);
    try {
      const resultsData = JSON.parse(await file.text());
      await mutate('RESULTS_SYNC', resultsData);
      setMessage({ type: 'success', text: "Risultati sincronizzati!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: "Errore: " + err.message });
    } finally {
      setActionLoading(false);
    }
  };

const steps = [
  { id: 1, title: 'Setup Stagione', path: '/admin/season-init', icon: Settings, help: 'Bootstrap Stagione e Round' },
  { id: 2, title: 'Squadre e Roster', path: '/teams', icon: Users, help: 'Visualizza Teams e Roster Round' },
  { id: 3, title: 'Build Lineup', path: '/lineup', icon: ClipboardCheck, help: 'Gestione Roster e Lineup' },
  { id: 4, title: 'Ingest Risultati', path: '/zrl-ingest', icon: Trophy, help: 'Caricamento JSON WTRL' },
  { id: 5, title: 'AI Optimizer', path: '/admin/optimizer', icon: Brain, help: 'Suggerimenti Strategici' },
  { id: 6, title: 'Classifiche', path: '/zrl-results', icon: LayoutGrid, help: 'Classifiche Divisione' },
  { id: 7, title: 'Analytics', path: '/zrl-analytics', icon: BarChart3, help: 'Analisi Tattica' },
  { id: 8, title: 'Recap Stagione', path: '/zrl-season-stats', icon: TrendingUp, help: 'Statistiche Performance' },
  { id: 9, title: 'Mappa Strategica', path: '/zrl-strategy', icon: MapIcon, help: 'Briefing Percorsi' },
];

// ... (dentro return)
return (
  <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 bg-zinc-950 min-h-screen">

    {/* 1. HERO SECTION */}
    <section className="h-72">
      <AdminTutorPanel />
    </section>

    {/* 2. NAVIGATION GRID */}
    <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <button
            key={step.id}
            onClick={() => navigate(step.path)}
            className="group relative bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#fc6719]/50 transition-all hover:shadow-[0_0_30px_-5px_rgba(252,103,25,0.2)] text-left flex flex-col justify-between h-48 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Icon size={80} />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-800 inline-block w-fit text-[#fc6719] shadow-inner border border-zinc-700">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-md font-black uppercase text-white tracking-tight leading-tight">{step.title}</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{step.help}</p>
            </div>
          </button>
        );
      })}
    </nav>
  </div>
);
};

export default ZRLOperations;
