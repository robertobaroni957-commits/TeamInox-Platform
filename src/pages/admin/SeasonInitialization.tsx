import React, { useState } from 'react';
import { useZRLReality } from '../../services/ZRLRealityProvider';
import { RefreshCw, AlertCircle, Layout, Activity, Terminal } from 'lucide-react';
import { SeasonInitProvider } from './SeasonInitContext';

// Importazione Componenti Modulari
import SeasonSelector from '../../components/admin/SeasonSelector';
import RoundSelector from '../../components/admin/RoundSelector';
import SeasonRealityPanel from '../../components/admin/SeasonRealityPanel';
import LifecycleState from '../../components/admin/LifecycleState';
import ImportProgress from '../../components/admin/ImportProgress';
import ActivityLog from '../../components/admin/ActivityLog';
import LifecycleActions from '../../components/admin/LifecycleActions';
import ImportActions from '../../components/admin/ImportActions';
import ImportOptions from '../../components/admin/ImportOptions';
import DangerZone from '../../components/admin/DangerZone';
import AdminTutorPanel from '../../components/admin/AdminTutorPanel';

/**
 * SeasonInitialization - Switchable Workspace System.
 * Riduzione del carico cognitivo tramite separazione dei contesti operativi.
 * Navigazione: [ Setup ] [ Pipeline ] [ Audit ]
 */
export default function SeasonInitialization() {
    const { isLoading, isError } = useZRLReality();
    const [activeWorkspace, setActiveWorkspace] = useState('setup');

    const workspaces = [
        { id: 'setup', label: 'Setup', icon: Layout },
        { id: 'pipeline', label: 'Pipeline', icon: Activity },
        { id: 'audit', label: 'Audit', icon: Terminal },
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
            <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
    );

    if (isError) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] text-red-500 gap-4">
            <AlertCircle size={48} />
            <h2 className="text-xl font-bold uppercase tracking-widest text-center">
                Errore Reality Layer
            </h2>
        </div>
    );

    return (
        <SeasonInitProvider>
            <div className="p-6 bg-[#0f0f0f] min-h-screen text-gray-300 font-sans selection:bg-blue-500/30 flex flex-col gap-6">
                
                {/* PAGE HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-900 pb-6">
                    <div>
                        <h1 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none">
                            Season <span className="text-gray-700">Control Center</span>
                        </h1>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1 italic">Switchable Workspace System v3.2</p>
                    </div>

                    {/* TOP WORKSPACE SWITCHER */}
                    <nav className="flex bg-[#11131a] p-1.5 rounded-2xl border border-gray-800 shadow-xl">
                        {workspaces.map((ws) => {
                            const Icon = ws.icon;
                            const isActive = activeWorkspace === ws.id;
                            return (
                                <button
                                    key={ws.id}
                                    onClick={() => setActiveWorkspace(ws.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                        isActive 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    <Icon size={14} />
                                    <span>{ws.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </header>

                {/* WORKSPACE CONTENT AREA */}
                <main className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    
                    {/* 1. SETUP WORKSPACE */}
                    {activeWorkspace === 'setup' && (
                        <div className="grid grid-cols-12 gap-8 items-start">
                            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                                <SeasonSelector />
                                <RoundSelector />
                            </div>
                            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SeasonRealityPanel />
                                <LifecycleState />
                                <div className="md:col-span-2">
                                    <LifecycleActions />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. PIPELINE WORKSPACE */}
                    {activeWorkspace === 'pipeline' && (
                        <div className="grid grid-cols-12 gap-8 items-start">
                            <div className="col-span-12 lg:col-span-4">
                                <ImportOptions />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <ImportActions />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <ImportProgress />
                            </div>
                        </div>
                    )}

                    {/* 3. AUDIT WORKSPACE */}
                    {activeWorkspace === 'audit' && (
                        <div className="grid grid-cols-12 gap-8 items-start">
                            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                                <AdminTutorPanel />
                                <ActivityLog />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <DangerZone />
                            </div>
                        </div>
                    )}

                </main>

                {/* FOOTER */}
                <footer className="mt-auto pt-4 border-t border-gray-900 flex justify-between items-center text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">
                    <span>Workspace: {activeWorkspace}</span>
                    <span>D1 Stable Infrastructure</span>
                </footer>

            </div>
        </SeasonInitProvider>
    );
}
