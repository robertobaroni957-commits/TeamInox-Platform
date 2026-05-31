import React, { useState } from 'react';
import { useZRLReality } from '../../services/ZRLRealityProvider';
import { RefreshCw, AlertCircle, Layout, Activity, Terminal, Users, ClipboardCheck, Trophy, Flag } from 'lucide-react';
import { RoundControlProvider, useRoundControl } from './RoundControlContext';

// Importazione Componenti Modulari
import SeasonSelector from '../../components/admin/SeasonSelector';
import RoundSelector from '../../components/admin/RoundSelector';
import RoundRealityPanel from '../../components/admin/SeasonRealityPanel';
import LifecycleState from '../../components/admin/LifecycleState';
import ActivityLog from '../../components/admin/ActivityLog';
import LifecycleActions from '../../components/admin/LifecycleActions';
import DangerZone from '../../components/admin/DangerZone';
import AdminTutorPanel from '../../components/admin/AdminTutorPanel';
import JsonIngestor from '../../components/admin/JsonIngestor';
import RoundScheduleImportPanel from '../../components/admin/RoundScheduleImportPanel';

import { useQueryClient } from '@tanstack/react-query';

// ... (dentro RoundControlCenterContent)
function RoundControlCenterContent() {
    const { isLoading, isError } = useZRLReality();
    const queryClient = useQueryClient();
    const { selectedWtrlId, selectedRoundId, activeRound } = useRoundControl();

    // Funzione di refresh globale (Safe)
    const handleRefresh = () => {
        // Invalida tutte le query relative a ZRL per forzare il ricaricamento
        queryClient.invalidateQueries();
    };
    const [activeWorkspace, setActiveWorkspace] = useState('setup');

    const workspaces = [
        { id: 'setup', label: 'Setup & Reality', icon: Layout },
        { id: 'pipeline', label: 'Pipeline Ingest', icon: Activity },
        { id: 'audit', label: 'Audit & Log', icon: Terminal },
    ];

    if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-[#050505]"><RefreshCw className="animate-spin text-blue-500" size={48} /></div>;
    if (isError) return <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-red-500 gap-4"><AlertCircle size={48} /></div>;

    const scraperScriptRaces = `(async () => {
        const season = ${selectedWtrlId || 19};
        const groups = ["A", "C"]; // A copre A/B, C copre C/D
        const results = {};
        for (const cat of groups) {
            console.log("Scarico gruppo " + cat + "...");
            try {
                const res = await fetch("https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=" + season + "&category=" + cat + "&action=schedule");
                const data = await res.json();
                results[cat] = data.payload || data;
            } catch(e) { console.error("Errore cat " + cat, e); }
        }
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "zrl_races_s" + season + ".json";
        a.click();
        console.log("✅ File gare scaricato!");
    })();`;

    const scraperScriptTeams = `(async () => {
        const season = ${selectedWtrlId || 19};
        console.log("🚀 Avvio scraping TEAM LIST Inox per Season " + season + "...");
        try {
            const res = await fetch("https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=" + season + "&action=teamlist");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "zrl_teams_s" + season + ".json";
            a.click();
            console.log("✅ File zrl_teams_s" + season + ".json scaricato con successo!");
            console.log("Ora caricalo nella piattaforma Inox.");
        } catch(e) { console.error("❌ Errore critico download teams", e); }
    })();`;

    const scraperScriptRoster = `(async () => {
        const season = ${selectedWtrlId || 19};
        console.log("Scarico Roster per Season " + season + "...");
        const leagueKeys = ["2370A10", "2370B10", "2370C10", "2370C20", "2370C30", "2370D10"];
        const rosters = [];
        for (const key of leagueKeys) {
            try {
                const res = await fetch("https://www.wtrl.racing/api/zrl/rosters/" + season + "/" + key);
                const data = await res.json();
                rosters.push({ key, data });
            } catch(e) { console.error("Errore roster " + key, e); }
        }
        const blob = new Blob([JSON.stringify(rosters, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "zrl_rosters_s" + season + ".json";
        a.click();
        console.log("✅ Roster scaricati!");
    })();`;

    const scraperScriptResults = `(async () => {
        const season = ${selectedWtrlId || 19};
        const race = ${activeRound?.round_number || 1};
        const leagueKeys = ["2370A10", "2370B10", "2370C10", "2370C20", "2370C30", "2370D10"];
        console.log("Scarico risultati per Season " + season + ", Race " + race);
        const finalResults = [];
        for (const key of leagueKeys) {
            try {
                const res = await fetch("https://www.wtrl.racing/api/zrl/results/" + season + "/" + key + "/" + race);
                const data = await res.json();
                if (data.success && data.payload) {
                    finalResults.push({ key, data });
                    console.log("✅ " + key + ": scaricato.");
                }
            } catch (e) { console.error("❌ Errore su " + key, e); }
        }
        const output = { round_id: ${selectedRoundId || 0}, results: finalResults };
        const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "zrl_results_s" + season + "_r" + race + ".json";
        a.click();
        console.log("✅ Risultati scaricati!");
    })();`;

    return (
        <div className="p-12 bg-[#050505] min-h-screen text-gray-300 font-sans selection:bg-blue-500/30 space-y-12">
            
            {/* 1. HERO: TUTOR */}
            <section className="max-w-[1600px] mx-auto">
                <AdminTutorPanel />
            </section>

            {/* 2. WORKSPACE SWITCHER */}
            <nav className="flex bg-[#11131a] p-2 rounded-[2rem] border border-gray-800 shadow-2xl w-fit mx-auto sticky top-8 z-[100] backdrop-blur-md bg-opacity-80">
                {workspaces.map((ws) => {
                    const Icon = ws.icon;
                    const isActive = activeWorkspace === ws.id;
                    return (
                        <button
                            key={ws.id}
                            onClick={() => setActiveWorkspace(ws.id)}
                            className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                isActive ? 'bg-[#fc6719] text-white shadow-xl scale-105' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                        >
                            <Icon size={18} />
                            <span>{ws.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* 3. DYNAMIC WORKSPACE CONTENT */}
            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
                
                {activeWorkspace === 'setup' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                        <section className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <SeasonSelector />
                                <RoundSelector />
                            </div>
                            <LifecycleActions />
                            <RoundScheduleImportPanel />
                        </section>
                        <section className="space-y-10">
                            <RoundRealityPanel />
                            <LifecycleState />
                        </section>
                    </div>
                )}


                {activeWorkspace === 'pipeline' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <JsonIngestor 
                            title="Sync Teams" 
                            apiEndpoint="/api/admin/zrl/import/teams" 
                            description="Sincronizza l'elenco delle squadre InoxTeam" 
                            scraperScript={scraperScriptTeams}
                            onSuccess={handleRefresh}
                        />
                        <JsonIngestor 
                            title="Sync Races" 
                            apiEndpoint="/api/admin/import-races-json" 
                            description="Importa il calendario gare WTRL" 
                            scraperScript={scraperScriptRaces}
                            onSuccess={handleRefresh}
                        />
                        <JsonIngestor 
                            title="Sync Roster" 
                            apiEndpoint="/api/admin/zrl/import/roster" 
                            description="Aggiorna i roster atleti per ogni lega" 
                            scraperScript={scraperScriptRoster}
                            onSuccess={handleRefresh}
                        />
                    </div>
                )}

                {activeWorkspace === 'audit' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <ActivityLog />
                        <DangerZone />
                    </div>
                )}

            </main>
        </div>
    );
}

export default function RoundControlCenter() {
    return (
        <RoundControlProvider>
            <RoundControlCenterContent />
        </RoundControlProvider>
    );
}
