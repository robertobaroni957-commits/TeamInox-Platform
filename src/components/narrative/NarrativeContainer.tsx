import React from 'react';
import { NarrativeStatus, NarrativeResponse } from '../../hooks/useNarrative';
import { NarrativeRenderer } from './NarrativeRenderer';
import { Loader2, AlertCircle, Info } from 'lucide-react';

interface NarrativeContainerProps {
    status: NarrativeStatus;
    report: NarrativeResponse | null;
    error: string | null;
    onRetry: () => void;
}

/**
 * NarrativeContainer - The Logic Switchboard
 * 
 * Responsibilities:
 * - Handling all UI states based on useNarrative status.
 * - Providing clean loading and error feedback.
 * - Orchestrating the pure NarrativeRenderer.
 */
export const NarrativeContainer: React.FC<NarrativeContainerProps> = ({ 
    status, 
    report, 
    error, 
    onRetry 
}) => {
    // 1. Loading State
    if (status === 'LOADING') {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500 animate-in fade-in duration-500">
                <Loader2 className="animate-spin mb-4 text-purple-500" size={48} />
                <p className="font-black uppercase tracking-[0.2em] text-xs">Analisi dati in corso...</p>
            </div>
        );
    }

    // 2. Error State
    if (status === 'ERROR') {
        return (
            <div className="p-10 bg-red-950/20 border border-red-500/20 rounded-[2.5rem] text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Errore di Generazione</h3>
                <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto font-medium">
                    {error || "Si è verificato un errore durante l'analisi AI."}
                </p>
                <button 
                    onClick={onRetry}
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                >
                    Riprova ora
                </button>
            </div>
        );
    }

    // 3. Success State
    if (status === 'SUCCESS' && report) {
        return <NarrativeRenderer data={report} />;
    }

    // 4. Idle State (Fallback)
    return (
        <div className="py-32 text-center text-zinc-600 animate-in fade-in duration-700">
            <Info className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-black uppercase tracking-widest text-xs italic">
                Seleziona i parametri per avviare l'analisi.
            </p>
        </div>
    );
};
