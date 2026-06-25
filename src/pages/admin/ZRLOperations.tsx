import React, { useEffect, useState } from 'react';
import { 
  Settings, Users, ClipboardCheck, 
  Trophy, TrendingUp,
  LayoutGrid, BarChart3, Brain, Map as MapIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useZRLReality } from '../../services/ZRLRealityProvider';
import AdminTutorPanel from '../../components/admin/AdminTutorPanel';
import { api } from '../../services/api';
import type { Role } from '../../services/permissions';

interface Step {
  id: number;
  title: string;
  path: string;
  icon: React.ElementType;
  help: string;
}

const ALL_STEPS: Step[] = [
  { id: 1, title: 'Setup Stagione',    path: '/admin/season-init', icon: Settings,   help: 'Bootstrap Stagione e Round'    },
  { id: 2, title: 'Squadre e Roster',  path: '/teams',             icon: Users,      help: 'Visualizza Teams e Roster Round' },
  { id: 3, title: 'Build Lineup',      path: '/lineup',            icon: ClipboardCheck, help: 'Gestione Roster e Lineup'  },
  { id: 4, title: 'Ingest Risultati',  path: '/zrl-ingest',        icon: Trophy,     help: 'Caricamento JSON WTRL'         },
  { id: 5, title: 'AI Optimizer',      path: '/admin/optimizer',   icon: Brain,      help: 'Suggerimenti Strategici'       },
  { id: 6, title: 'Classifiche',       path: '/zrl-results',       icon: LayoutGrid, help: 'Classifiche Divisione'         },
  { id: 7, title: 'Analytics',         path: '/zrl-analytics',     icon: BarChart3,  help: 'Analisi Tattica'               },
  { id: 8, title: 'Recap Stagione',    path: '/zrl-season-stats',  icon: TrendingUp, help: 'Statistiche Performance'       },
  { id: 9, title: 'Mappa Strategica',  path: '/zrl-strategy',      icon: MapIcon,    help: 'Briefing Percorsi'             },
];

// Step ids visibili per ogni profilo
const STEP_IDS_ADMIN    = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const STEP_IDS_CAPTAIN  = [2, 3, 6, 7, 8, 9];   // squadre, lineup, classifiche + analisi/mappa
const STEP_IDS_ROSTER   = [6];                   // solo classifiche
const STEP_IDS_NOTROSTER = [];                   // nessun step: mostra solo il CTA questionario

const ZRLOperations: React.FC = () => {
  const navigate = useNavigate();
  const { seasons } = useZRLReality();

  const [role, setRole] = useState<Role | null>(null);
  const [isOnRoster, setIsOnRoster] = useState(false);
  const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);
  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role as Role);
      } catch (_) {}
    }

    Promise.all([
      api.checkZRLParticipation().catch(() => false),
      api.checkAvailabilityStatus().catch(() => ({ missing: false })),
    ]).then(([onRoster, avStatus]) => {
      setIsOnRoster(onRoster);
      setNeedsQuestionnaire(avStatus.missing);
    }).finally(() => setLoadingState(false));
  }, []);

  const isAdmin = role === 'admin' || role === 'moderator';
  const isCaptain = role === 'captain';

  const visibleStepIds = isAdmin
    ? STEP_IDS_ADMIN
    : isCaptain
    ? STEP_IDS_CAPTAIN
    : isOnRoster
    ? STEP_IDS_ROSTER
    : STEP_IDS_NOTROSTER;

  const visibleSteps = ALL_STEPS.filter(s => visibleStepIds.includes(s.id));

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 bg-zinc-950 min-h-screen">

      {/* HERO — solo admin */}
      {isAdmin && (
        <section className="h-72">
          <AdminTutorPanel />
        </section>
      )}

      {/* HEADER per non-admin */}
      {!isAdmin && (
        <section className="space-y-2 pt-4">
          <div className="px-4 py-1.5 bg-[#fc6719]/10 border border-[#fc6719]/20 rounded-full inline-block">
            <span className="text-[9px] font-black text-[#fc6719] uppercase tracking-[0.3em]">ZRL Hub</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">
            ZRL 2025/26
          </h1>
          <p className="text-zinc-500 font-bold italic text-sm uppercase tracking-widest">
            {isCaptain
              ? "Gestisci la tua squadra, la lineup e le classifiche."
              : isOnRoster
              ? "Accedi ai moduli ZRL disponibili per chi è nei roster ufficiali WTRL."
              : "Il questionario è sempre disponibile. Le altre funzioni si sbloccano solo se sei nel roster ufficiale WTRL."}
          </p>
        </section>
      )}

      {!isAdmin && (
        <button
          onClick={() => navigate('/availability')}
          className={`w-full p-6 rounded-[2rem] transition-all text-left flex items-center justify-between group ${
            needsQuestionnaire
              ? 'bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20'
              : 'bg-zinc-900 border border-zinc-800 hover:border-orange-500/30'
          }`}
        >
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${needsQuestionnaire ? 'text-orange-400' : 'text-zinc-500'}`}>
              {needsQuestionnaire ? 'Azione richiesta' : 'Sempre disponibile'}
            </p>
            <h3 className="text-2xl font-black italic text-white uppercase">Questionario Disponibilità</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase mt-1">
              {needsQuestionnaire
                ? 'Conferma la tua partecipazione al prossimo round ZRL.'
                : 'Apri o aggiorna in qualsiasi momento disponibilità, intent e preferenze orarie.'}
            </p>
          </div>
          <ClipboardCheck size={32} className={`${needsQuestionnaire ? 'text-orange-400' : 'text-zinc-400'} group-hover:scale-110 transition-transform shrink-0 ml-6`} />
        </button>
      )}

      {/* NAVIGATION GRID */}
      {!loadingState && visibleSteps.length > 0 && (
        <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleSteps.map((step) => {
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
      )}

      {/* Stato vuoto: non in roster e questionario già compilato */}
      {!loadingState && !isAdmin && visibleSteps.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-500 font-bold italic uppercase tracking-widest text-sm">
            Non sei ancora inserito in nessun roster ufficiale WTRL. Il questionario resta comunque sempre accessibile.
          </p>
        </div>
      )}

    </div>
  );
};

export default ZRLOperations;
