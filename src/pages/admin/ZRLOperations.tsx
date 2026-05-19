import React, { useState } from 'react';
import { 
  Settings, Users, RefreshCw, Zap, ClipboardCheck, 
  Trophy, ChevronRight, AlertCircle, Calendar, CheckCircle2,
  Trash2, Plus, Save, Activity, TrendingUp,
  LayoutGrid, BarChart3, Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useZRLReality } from '../../services/ZRLRealityProvider';

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

  // Form States (Local to this UI but driving mutations)
  const [roundName, setRoundName] = useState('ZRL 2026');
  const [wtrlId, setWtrlId] = useState('20');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('A');
  const [selectedRace, setSelectedRace] = useState<RoundInput | null>(null);

  const activeSeason = (seasons && Array.isArray(seasons.data)) 
    ? seasons.data.find((s: any) => s.is_active) 
    : null;
  const teams = Array.isArray(teamsData?.data) ? teamsData.data : [];

  const handleBootstrap = async () => {
    setActionLoading(true);
    try {
      await mutate('SEASON_BOOTSTRAP', { name: roundName, externalId: parseInt(wtrlId) });
      setMessage({ type: 'success', text: "Stagione inizializzata con successo!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: "Errore: " + err.message });
    } finally {
      setActionLoading(false);
    }
  };

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
    { id: 1, title: 'Setup & Sync', icon: Settings, help: 'Bootstrap Stagione e Round' },
    { id: 2, title: 'Teams & Rosters', icon: Users, help: 'Lista Squadre Inox e Membri' },
    { id: 3, title: 'Disponibilità', icon: ClipboardCheck, help: 'Report orari e RSVP Corridori' },
    { id: 4, title: 'AI Optimizer', icon: Brain, help: 'Suggerimenti Strategici Rose' },
    { id: 5, title: 'Gare & Lineup', icon: Zap, help: 'Schieramento Titolari (War Room)' },
    { id: 6, title: 'Risultati & Media', icon: Trophy, help: 'Ingestion Risultati via Kernel' },
    { id: 7, title: 'Rankings View', icon: LayoutGrid, help: 'Classifiche di Divisione' },
    { id: 8, title: 'Strat Map', icon: BarChart3, help: 'Analisi Tattica Radar' },
    { id: 9, title: 'Recap Stagione', icon: TrendingUp, help: 'Statistiche e Performance' },
  ];

  if (isLoading) return <div className="p-12 text-center font-black italic uppercase text-zinc-500">Loading Reality Layer...</div>;
  if (isError) return <div className="p-12 text-center font-black italic uppercase text-red-500">Error connecting to D1</div>;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* ... header ... */}
      <header className="border-b border-zinc-900 pb-4 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#fc6719]">
            <Settings size={16} />
            <span className="font-black text-[9px] tracking-[0.2em] uppercase italic">Admin Command Center</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-white uppercase">
            ZRL <span className="text-zinc-700">Operations</span>
          </h1>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black uppercase text-zinc-500">Active Season</p>
           <p className="text-sm font-black italic text-[#fc6719] uppercase">{activeSeason?.name || 'None'}</p>
        </div>
      </header>

      <nav className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => {
                if (step.id === 1) {
                  navigate('/admin/season-init');
                } else {
                  setActiveStep(step.id);
                }
              }}
              className={`relative flex items-center p-6 rounded-3xl border-2 transition-all text-left group ${
                isActive ? "bg-zinc-800 border-[#fc6719]" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className={`p-4 rounded-2xl mr-5 ${isActive ? "bg-[#fc6719] text-black" : "bg-zinc-800 text-zinc-400"}`}>
                <Icon size={24} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase text-zinc-500">Step 0{step.id}</span>
                 <span className={`text-sm font-black uppercase italic ${isActive ? "text-white" : "text-zinc-300"}`}>{step.title}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <main className="bg-zinc-900/60 rounded-[2.5rem] border-2 border-zinc-700 min-h-[600px] relative overflow-hidden backdrop-blur-md p-8 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div key={activeStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {message && (
              <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="font-bold uppercase text-[10px] tracking-widest">{message.text}</p>
              </div>
            )}

            {activeStep === 0 && <div className="text-center py-20 text-zinc-500 uppercase font-black italic">Seleziona un modulo operativo</div>}

            {activeStep === 2 && <TeamsPage />}
            {activeStep === 3 && <AvailabilityManagement />}
            {activeStep === 4 && <RosterSuggestions />}
            {activeStep === 5 && <RosterBuilder isEmbedded={true} />}

            {/* STEP 6: RESULTS (Rewired) */}
            {activeStep === 6 && (
              <div className="space-y-8 text-center">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Results Ingestion</h3>
                <div className="p-12 rounded-3xl bg-zinc-950 border border-zinc-800 inline-block w-full max-w-2xl mx-auto">
                   <label className="cursor-pointer group">
                      <div className="p-20 border-2 border-dashed border-zinc-800 rounded-2xl group-hover:border-[#fc6719] transition-all">
                        <Trophy size={64} className="mx-auto text-zinc-700 group-hover:text-[#fc6719] mb-4" />
                        <p className="text-zinc-500 font-bold uppercase text-xs group-hover:text-white">Carica JSON Risultati WTRL</p>
                      </div>
                      <input type="file" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleSyncResults(file);
                      }} />
                   </label>
                </div>
              </div>
            )}

            {activeStep === 7 && <ZRLDivisionResults />}
            {activeStep === 8 && <ZRLAnalytics />}
            {activeStep === 9 && <ZRLSeasonStats />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ZRLOperations;
