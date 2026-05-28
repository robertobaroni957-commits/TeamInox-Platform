import React from 'react';
import { Play, Archive, RefreshCw, Trash2, Info } from 'lucide-react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';
import { toast } from 'sonner';

/**
 * LifecycleActions - Gestisce lo stato vitale del sistema.
 * Aggiornato con Functional Tooltips per una UX più sicura.
 */
export default function LifecycleActions() {
  const { executeAction, selectedRoundId, selectedWtrlId, activeRound, isProcessing } = useRoundControl();

  const handleAction = async (type: string, label: string) => {
    if (!selectedRoundId && !selectedWtrlId) return;
    const toastId = toast.loading(`Esecuzione azione: ${label}...`);
    try {
      await executeAction(type, {}, label);
      toast.success(`Azione ${label} completata per Round ${activeRound?.wtrl_id || '---'}`, { id: toastId });
    } catch (err: any) {
      toast.error(`Errore: ${err.message}`, { id: toastId });
    }
  };

  const actions = [
    { 
        title: "Activate", 
        type: "ROUND_ACTIVATE", 
        icon: Play, 
        variant: "primary", 
        label: "Attiva",
        help: "Attiva il round selezionato rendendolo operativo per tutte le funzioni della piattaforma.",
        effect: "Cambia lo stato del round in 'active' nel database."
    },
    { 
        title: "Reactivate", 
        type: "ROUND_REACTIVATE", 
        icon: Play, 
        variant: "primary", 
        label: "Riattiva",
        help: "Riattiva un round precedentemente archiviato per consentire ulteriori operazioni.",
        effect: "Riporta lo stato del round da 'archived' a 'active'."
    },
    { 
        title: "Archive", 
        type: "ROUND_ARCHIVE", 
        icon: Archive, 
        variant: "warning", 
        label: "Archivia",
        help: "Archivia il round. Disabilita le modifiche ai dati.",
        effect: "Sposta il record in stato 'archived'. Azione reversibile."
    },
    { 
        title: "Reset", 
        type: "ROUND_RESET", 
        icon: RefreshCw, 
        variant: "secondary", 
        label: "Reset",
        help: "Ripristina lo stato iniziale della configurazione del round.",
        effect: "Rimuove le cache locali e riporta il sync_state a 'PENDING'."
    },
    { 
        title: "Wipe", 
        type: "ROUND_WIPE", 
        icon: Trash2, 
        variant: "danger", 
        label: "Wipe",
        help: "Elimina permanentemente TUTTI i dati associati al round corrente.",
        effect: "TRUNCATE delle tabelle race_lineup e availability per questo scope.",
        warning: "AZIONE IRREVERSIBILE"
    },
  ];

  return (
    <div className="bg-[#11131a] border border-gray-800 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <Play size={20} />
          </div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">LIFECYCLE ACTIONS</h3>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {actions.map((action) => (
          <div key={action.title} className="group relative">
            <button
                onClick={() => handleAction(action.type, action.title)}
                disabled={isProcessing || (!selectedRoundId && !selectedWtrlId)}
                className={`
                w-full flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300
                bg-[#090a10] border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 active:scale-95 shadow-lg
                ${action.variant === 'danger' ? 'hover:border-red-500/50 hover:bg-red-500/5' : ''}
                ${action.variant === 'warning' ? 'hover:border-amber-500/50 hover:bg-amber-500/5' : ''}
                ${action.variant === 'primary' ? 'hover:border-blue-500/50 hover:bg-blue-500/5' : ''}
                ${action.variant === 'secondary' ? 'hover:border-gray-600 hover:bg-gray-800/20' : ''}
                `}
            >
                <div className="p-2 bg-zinc-900 rounded-lg shadow-inner group-hover:bg-zinc-800 transition-colors">
                    <action.icon size={20} className={action.variant === 'danger' ? 'text-red-500' : action.variant === 'warning' ? 'text-amber-500' : 'text-blue-500'} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{action.label}</span>
            </button>

            {/* Functional Tooltip */}
            <div className="absolute z-50 invisible group-hover:visible bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-72 -top-4 left-full ml-6 shadow-2xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                <div className="flex items-center gap-3 mb-3">
                    <Info size={16} className="text-blue-500" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest leading-none">{action.title}</h4>
                </div>
                <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed mb-4 italic tracking-wide">{action.help}</p>
                <div className="pt-3 border-t border-zinc-800/50">
                    <span className="block text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest leading-none">Effetto Operativo:</span>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-tight">{action.effect}</p>
                </div>
                {action.warning && (
                    <div className="mt-3 pt-3 border-t border-red-900/30 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.15em]">{action.warning}</span>
                    </div>
                )}
                
                {/* Tooltip arrow */}
                <div className="absolute top-8 -left-2 w-4 h-4 bg-zinc-950 border-l border-b border-zinc-800 rotate-45"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
