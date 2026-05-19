import React from 'react';
import { Trash2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';
import { toast } from 'sonner';

export default function DangerZone() {
  const { executeAction, selectedSeasonId, isProcessing } = useSeasonInit();

  const handleWipe = async () => {
    if (!selectedSeasonId) return;
    const toastId = toast.loading("Wipe in corso...");
    try {
        await executeAction('SEASON_WIPE', {}, "Wipe Totale");
        toast.success("Wipe completato", { id: toastId });
    } catch (err: any) {
        toast.error(`Errore: ${err.message}`, { id: toastId });
    }
  };

  return (
    <div className="bg-[#11131a] border border-red-900/30 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden flex flex-col text-left">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-red-500/5 rounded-full blur-3xl text-left"></div>
      
      <div className="flex items-center gap-3 mb-8 text-left">
        <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
            <Trash2 size={20} />
        </div>
        <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">DANGER ZONE</h3>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl mb-8 flex items-start gap-4 text-left">
        <AlertOctagon size={24} className="text-red-500 shrink-0 mt-1" />
        <div className="text-left">
            <p className="text-xs font-black text-red-100 uppercase tracking-tight mb-1 text-left">
                ATTENZIONE: Azioni Irreversibili
            </p>
            <p className="text-[10px] text-red-400 font-bold uppercase leading-relaxed text-left">
                Le operazioni in questa sezione hanno un impatto distruttivo totale. Una volta confermate, i dati non potranno essere recuperati.
            </p>
        </div>
      </div>

      <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl mb-8 space-y-4 text-left">
          <div className="flex items-center gap-2 mb-2">
              <Info size={12} className="text-gray-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Impact Summary</span>
          </div>
          
          <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-[10px] font-black text-gray-300 uppercase text-left">Eliminazione Season Globale</span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                  <div className="w-1 h-1 rounded-full bg-red-900 text-left"></div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase italic text-left">Inclusi metadati, log e classifiche storiche</span>
              </div>
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] text-left"></div>
                  <span className="text-[10px] font-black text-gray-300 uppercase text-left">Wipe di tutti i 4 Round (Mini-Seasons)</span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                  <div className="w-1 h-1 rounded-full bg-red-900 text-left"></div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase italic text-left">Gare, Roster, Squadre e Risultati per ogni Round</span>
              </div>
          </div>
      </div>

      <div className="space-y-4 mt-auto text-left">
          <button 
            onClick={handleWipe}
            disabled={isProcessing || !selectedSeasonId}
            className="w-full group flex items-center justify-between p-5 bg-red-500/5 border border-red-500/20 rounded-2xl hover:bg-red-500/10 hover:border-red-500/50 transition-all disabled:opacity-50"
          >
              <div className="text-left">
                  <span className="block text-xs font-black text-red-500 uppercase italic text-left">Wipe All Rounds</span>
                  <span className="block text-[9px] text-red-900 font-bold uppercase mt-0.5 text-left">Svuota database per la stagione corrente</span>
              </div>
              <AlertTriangle size={18} className="text-red-900 group-hover:text-red-500 transition-colors" />
          </button>

          <button 
            disabled={isProcessing || !selectedSeasonId}
            className="w-full group flex items-center justify-between p-5 bg-black border border-gray-800 rounded-2xl hover:border-red-500 transition-all disabled:opacity-50"
          >
              <div className="text-left">
                  <span className="block text-xs font-black text-gray-400 group-hover:text-white uppercase italic transition-colors text-left">Delete Global Season</span>
                  <span className="block text-[9px] text-gray-700 font-bold uppercase mt-0.5 text-left">Rimuove interamente la stagione dal sistema</span>
              </div>
              <Trash2 size={18} className="text-gray-800 group-hover:text-red-500 transition-colors" />
          </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 opacity-30 text-left">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] text-left">Hardware Safety Lock Enabled</span>
      </div>
    </div>
  );
}
