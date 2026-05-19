import React from 'react';
import { Users, Flag, Calendar, Trophy, ArrowRight, Target, Info } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';
import { toast } from 'sonner';

/**
 * ImportActions - Gestisce le operazioni di sincronizzazione dati.
 * Aggiornato con Functional Tooltips per una UX guidata.
 */
export default function ImportActions() {
  const { executeAction, selectedSeasonId, activeRound, isProcessing } = useSeasonInit();

  const handleImport = async (type: string, label: string) => {
    if (!selectedSeasonId) return;

    const toastId = toast.loading(`Avvio importazione: ${label} (Round ${activeRound})...`);
    try {
      await executeAction(type, {}, label);
      toast.success(`${label} completato con successo per il Round ${activeRound}`, { id: toastId });
    } catch (err: any) {
      toast.error(`Errore durante ${label}: ${err.message}`, { id: toastId });
    }
  };

  const actions = [
    { 
        title: "Teams", 
        type: "TEAM_SYNC", 
        icon: Users, 
        description: "Roster WTRL",
        help: "Sincronizza l'elenco dei team e i relativi componenti iscritti per il round corrente.",
        effect: "Popola la tabella round_teams e aggiorna i metadati degli atleti.",
        warning: "I roster locali verranno sovrascritti."
    },
    { 
        title: "Races", 
        type: "RACE_IMPORT", 
        icon: Flag, 
        description: "Percorsi",
        help: "Importa le specifiche delle gare (mondo, percorso, distanza, lead-in) da WTRL.",
        effect: "Crea o aggiorna i record nella tabella rounds per il round attivo.",
        warning: "Eventuali distanze manuali saranno sovrascritte."
    },
    { 
        title: "Schedule", 
        type: "METADATA_SYNC", 
        icon: Calendar, 
        description: "Calendario",
        help: "Importa i meta-dati temporali e gli orari di partenza previsti per ciascuna divisione.",
        effect: "Sincronizza le date di inizio delle gare nel sistema di pianificazione.",
        warning: null
    },
    { 
        title: "Results", 
        type: "RESULTS_SYNC", 
        icon: Trophy, 
        description: "Risultati",
        help: "Recupera i tempi e i piazzamenti ufficiali da ZwiftPower per tutte le divisioni.",
        effect: "Esegue il calcolo dei punti e popola le tabelle dei risultati finali.",
        warning: "Richiede che la gara sia conclusa e processata da ZP."
    },
  ];

  return (
    <div className="bg-[#11131a] border border-gray-800 p-6 rounded-2xl shadow-xl h-full backdrop-blur-sm relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Target size={120} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 text-left">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Trophy size={16} /></div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">IMPORT OPERATIONS</h3>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <Target size={10} className="text-blue-400" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                Round 0{activeRound}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => (
          <div key={action.title} className="group/item relative">
            <button 
                onClick={() => handleImport(action.type, action.title)}
                disabled={isProcessing || !selectedSeasonId}
                className="w-full flex items-center gap-4 p-3 border border-gray-800 rounded-xl bg-[#090a10] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group text-left shadow-inner disabled:opacity-30"
            >
                <div className="p-2 bg-gray-900 rounded-lg text-blue-500 group-hover/item:scale-110 transition-transform">
                    <action.icon size={18} />
                </div>
                <div className="flex-1">
                    <span className="block text-[11px] font-black text-white uppercase italic tracking-tight">{action.title}</span>
                    <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest">{action.description}</span>
                </div>
                <ArrowRight size={14} className="text-gray-700 group-hover/item:text-blue-500 group-hover/item:translate-x-1 transition-all" />
            </button>

            {/* Functional Tooltip */}
            <div className="absolute z-50 invisible group-hover/item:visible bg-black border border-gray-700 p-4 rounded-xl w-72 -top-2 left-full ml-4 shadow-2xl pointer-events-none transition-all duration-200 opacity-0 group-hover/item:opacity-100 scale-95 group-hover/item:scale-100">
                <div className="flex items-center gap-2 mb-2">
                    <Info size={12} className="text-blue-500" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Config: {action.title}</h4>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase leading-tight mb-3 italic">{action.help}</p>
                <div className="pt-2 border-t border-gray-800">
                    <span className="block text-[8px] font-black text-gray-600 uppercase mb-1">Effetto Operativo:</span>
                    <p className="text-[9px] text-gray-500 font-bold uppercase leading-tight">{action.effect}</p>
                </div>
                {action.warning && (
                    <div className="mt-2 pt-2 border-t border-red-900/50 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-red-500 uppercase">{action.warning}</span>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
