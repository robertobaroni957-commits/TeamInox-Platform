import React from 'react';
import { Play, Archive, RefreshCw, Trash2, Info } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';
import { toast } from 'sonner';

/**
 * LifecycleActions - Gestisce lo stato vitale del sistema.
 * Aggiornato con Functional Tooltips per una UX più sicura.
 */
export default function LifecycleActions() {
  const { executeAction, selectedSeasonId, activeRound, isProcessing } = useSeasonInit();

  const handleAction = async (type: string, label: string) => {
    if (!selectedSeasonId) return;
    const toastId = toast.loading(`Esecuzione azione: ${label}...`);
    try {
      await executeAction(type, {}, label);
      toast.success(`Azione ${label} completata per Round ${activeRound}`, { id: toastId });
    } catch (err: any) {
      toast.error(`Errore: ${err.message}`, { id: toastId });
    }
  };

  const actions = [
    { 
        title: "Activate", 
        type: "SEASON_ACTIVATE", 
        icon: Play, 
        variant: "primary", 
        label: "Attiva",
        help: "Attiva il round selezionato rendendolo operativo per tutte le funzioni della piattaforma.",
        effect: "Cambia lo stato della serie in 'active' nel database."
    },
    { 
        title: "Archive", 
        type: "SEASON_ARCHIVE", 
        icon: Archive, 
        variant: "warning", 
        label: "Archivia",
        help: "Archivia il round o la stagione. Disabilita le modifiche ai dati.",
        effect: "Sposta il record in stato 'archived'. Azione reversibile."
    },
    { 
        title: "Reset", 
        type: "SEASON_RESET", 
        icon: RefreshCw, 
        variant: "secondary", 
        label: "Reset",
        help: "Ripristina lo stato iniziale della configurazione del round.",
        effect: "Rimuove le cache locali e riporta il lifecycle a 'READY'."
    },
    { 
        title: "Wipe", 
        type: "SEASON_WIPE", 
        icon: Trash2, 
        variant: "danger", 
        label: "Wipe",
        help: "Elimina permanentemente TUTTI i dati associati al round corrente.",
        effect: "TRUNCATE delle tabelle rounds, race_lineup e availability per questo scope.",
        warning: "AZIONE IRREVERSIBILE"
    },
  ];

  return (
    <div className="bg-[#11131a] border border-gray-800 p-6 rounded-2xl shadow-xl h-full backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Play size={16} /></div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">LIFECYCLE ACTIONS</h3>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <div key={action.title} className="group relative">
            <button
                onClick={() => handleAction(action.type, action.title)}
                disabled={isProcessing || !selectedSeasonId}
                className={`
                w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300
                bg-[#090a10] border-gray-800 text-gray-400 hover:text-white disabled:opacity-30
                ${action.variant === 'danger' ? 'hover:border-red-500/50 hover:bg-red-500/5' : ''}
                ${action.variant === 'warning' ? 'hover:border-amber-500/50 hover:bg-amber-500/5' : ''}
                ${action.variant === 'primary' ? 'hover:border-blue-500/50 hover:bg-blue-500/5' : ''}
                ${action.variant === 'secondary' ? 'hover:border-gray-600 hover:bg-gray-800/20' : ''}
                `}
            >
                <action.icon size={18} className={action.variant === 'danger' ? 'text-red-500' : action.variant === 'warning' ? 'text-amber-500' : 'text-blue-500'} />
                <span className="text-[9px] font-black uppercase tracking-widest">{action.label}</span>
            </button>

            {/* Functional Tooltip */}
            <div className="absolute z-50 invisible group-hover:visible bg-black border border-gray-700 p-4 rounded-xl w-64 -top-2 left-full ml-4 shadow-2xl pointer-events-none transition-all duration-200 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                <div className="flex items-center gap-2 mb-2">
                    <Info size={12} className="text-blue-500" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{action.title}</h4>
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
