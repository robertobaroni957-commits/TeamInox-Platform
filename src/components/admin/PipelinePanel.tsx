import React from 'react';
import { Users, ClipboardCheck, Trophy, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';
import { toast } from 'sonner';

export default function PipelinePanel({ title, type, icon: Icon, description }: any) {
  const { executeAction, isProcessing, activeRound } = useRoundControl();

  const handleAction = async () => {
    if (!activeRound) {
        toast.error("Nessun round attivo selezionato");
        return;
    }
    const toastId = toast.loading(`Esecuzione ${title}...`);
    try {
      await executeAction(type, { roundId: activeRound.id }, title);
      toast.success(`${title} completato`, { id: toastId });
    } catch (err: any) {
      toast.error(`Errore: ${err.message}`, { id: toastId });
    }
  };

  return (
    <div className="bg-[#11131a] border border-gray-800 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm flex flex-col justify-between hover:border-blue-500/30 transition-all group">
        <div>
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/20">
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.1em]">{title}</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{description}</p>
                </div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6">
                Sincronizza i dati operativi direttamente dal provider WTRL per il Round {activeRound?.round_number || '---'}.
            </p>
        </div>

        <button 
            onClick={handleAction}
            disabled={isProcessing || !activeRound}
            className="w-full py-4 bg-gray-900 hover:bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
            <RefreshCw size={14} className={isProcessing ? "animate-spin" : ""} />
            Esegui Sincronizzazione
        </button>
    </div>
  );
}
