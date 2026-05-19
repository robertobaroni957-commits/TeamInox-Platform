import React from 'react';
import { 
    Compass, 
    ArrowRight, 
    AlertTriangle, 
    Lock, 
    CheckCircle2, 
    Activity,
    Info,
    Zap
} from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';

/**
 * AdminTutorPanel - Assistente Operativo per il Workflow di Inizializzazione.
 * Fornisce guidance contestuale basata sullo stato della Season e del Round attivo.
 */
export default function AdminTutorPanel() {
    const { activeRound, activeSeason, isProcessing } = useSeasonInit();

    // Logica di derivazione dello stato (Mock/Heuristic)
    const isSeasonReady = !!activeSeason;
    const isRoundConfigured = activeRound > 0;
    
    // Suggerimento dinamico basato sul contesto
    const getNextStep = () => {
        if (!isSeasonReady) return "Inizializza la Stagione Globale";
        if (isProcessing) return "Attendi il completamento della sincronizzazione";
        return `Esegui Step 1: Importazione Gare per Round 0${activeRound}`;
    };

    return (
        <div className="bg-[#11131a] border border-gray-800 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden flex flex-col">
            {/* Background Accent */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500 border border-blue-500/20">
                    <Compass size={20} />
                </div>
                <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-0.5">OPERATIONAL TUTOR</h3>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest italic">Workflow Guidance System</p>
                </div>
            </div>

            <div className="space-y-8 flex-1">
                {/* 1. CURRENT SYSTEM STATUS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={12} className="text-gray-600" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Current System Status</span>
                    </div>
                    <div className="space-y-2.5 px-1">
                        <StatusItem label="Season Identity" active={isSeasonReady} />
                        <StatusItem label={`Round 0${activeRound} Context`} active={isRoundConfigured} />
                        <StatusItem label="Data Ingestion Layer" active={false} />
                    </div>
                </section>

                {/* 2. SUGGESTED NEXT STEP */}
                <section className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-2xl relative group hover:border-blue-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-left">Suggested Next Step</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-bold text-gray-200 uppercase tracking-tight text-left">
                            {getNextStep()}
                        </p>
                        <ArrowRight size={16} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                </section>

                {/* 3. BLOCKED ACTIONS & WARNINGS */}
                <section className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock size={12} className="text-red-900" />
                            <span className="text-[10px] font-black text-red-900 uppercase tracking-widest text-left">Blocked Actions</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-600 uppercase pl-1 text-left">
                            → Archive Season (Round incompleti)<br />
                            → Wipe Data (Sync in corso)
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-800/50 text-left">
                        <div className="flex items-center gap-2 mb-1 text-left">
                            <AlertTriangle size={12} className="text-orange-900" />
                            <span className="text-[10px] font-black text-orange-900 uppercase tracking-widest text-left">Operational Warnings</span>
                        </div>
                        <div className="flex gap-2 items-start px-1 text-left">
                            <Info size={10} className="text-orange-500 mt-0.5 shrink-0" />
                            <p className="text-[9px] font-bold text-orange-500/70 uppercase leading-normal text-left italic">
                                L'importazione delle squadre sovrascriverà eventuali roster manuali già presenti nel sistema.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* 4. SYSTEM READINESS */}
            <div className="mt-10 pt-6 border-t border-gray-800">
                <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-left">System Readiness</span>
                    <span className="text-lg font-black text-white italic leading-none">35%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-gray-800/50 shadow-inner">
                    <div className="h-full w-[35%] bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>
                <div className="mt-4 flex justify-between items-center text-[8px] font-black text-gray-700 uppercase tracking-widest">
                    <span>Alpha Build 0.1</span>
                    <span className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        Live Telemetry
                    </span>
                </div>
            </div>
        </div>
    );
}

function StatusItem({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between group">
            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-tight text-left">
                {label}
            </span>
            {active ? (
                <CheckCircle2 size={12} className="text-green-500" />
            ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
            )}
        </div>
    );
}
