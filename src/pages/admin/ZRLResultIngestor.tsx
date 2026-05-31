import React, { useState } from 'react';
import { 
  Trophy, Upload, FileJson, AlertCircle, CheckCircle2, RefreshCw, 
  Shield, Download, ClipboardCheck, Info, Zap
} from 'lucide-react';
import { useZRLReality } from '../../services/ZRLRealityProvider';
import { useRoundControl } from './RoundControlContext';
import { toast } from 'sonner';

const ZRLResultIngestor: React.FC = () => {
    const { mutate, teams: teamsQuery } = useZRLReality();
    const { activeRound, selectedWtrlId, selectedRoundId } = useRoundControl();
    
    // Generiamo le chiavi delle leghe dinamicamente dai team Inox
    const leagueKeys = React.useMemo(() => {
        const teams = teamsQuery?.data || [];
        const keys = teams
            .filter((t: any) => t.league && t.league !== '')
            .map((t: any) => {
                const l = t.league; // es. 350
                const c = t.category || 'A'; // es. C
                const d = t.division_number || 0; // es. 2
                // Formula corretta WTRL: prefisso 2 + lega + categoria + divisione + 0
                return `2${l}${c}${d}0`;
            });
        return [...new Set(keys)]; // Rimuoviamo duplicati
    }, [teamsQuery?.data]);

    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [copiedScript, setCopiedScript] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('loading');
        try {
            const raw = await file.text();
            const data = JSON.parse(raw);
            
            // 🔥 FIX: L'API richiede roundId all'interno del payload (non round_id)
            const payload = {
                roundId: selectedRoundId || activeRound?.id,
                results: data.results || data
            };

            await mutate('RESULTS_SYNC', payload);
            setStatus('success');
            setMessage("Sincronizzazione completata!");
            toast.success("Database aggiornato con successo");
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || "Errore durante l'elaborazione.");
            toast.error("Errore di sincronizzazione");
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopiedScript(type);
        toast.success(`Script ${type} copiato negli appunti!`);
        setTimeout(() => setCopiedScript(null), 3000);
    };

    const scraperKeysStr = JSON.stringify(leagueKeys.length > 0 ? leagueKeys : ["2370A10", "2370B10", "2370C10", "2370C20", "2370C30", "2370D10"]);

    // 1. Script per i Risultati della Gara (Race Results)
    const scraperScriptRace = `(async () => {
        const season = ${selectedWtrlId || 19};
        const race = ${activeRound?.round_number || 1};
        const leagueKeys = ${scraperKeysStr};
        console.log("🚀 Scarico RISULTATI GARA per Season " + season + ", Race " + race);
        const results = [];
        for (const key of leagueKeys) {
            try {
                const res = await fetch("https://www.wtrl.racing/api/zrl/results/" + season + "/" + key + "/" + race);
                const data = await res.json();
                if (data.success && data.payload) {
                    results.push({ key, data });
                    console.log("✅ " + key + ": scaricato.");
                }
            } catch (e) { console.error("❌ Errore su " + key, e); }
        }
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "zrl_race_results_s" + season + "_r" + race + ".json";
        a.click();
        console.log("✅ File Risultati Gara scaricato!");
    })();`;

    // 2. Script per la Classifica Generale (Division GC)
    const scraperScriptGC = `(async () => {
        const season = ${selectedWtrlId || 19};
        const race = ${activeRound?.round_number || 1};
        const leagueKeys = ${scraperKeysStr};
        console.log("🚀 Scarico CLASSIFICA GENERALE (GC) per Season " + season + " (aggiornata a Race " + race + ")");
        const results = [];
        for (const key of leagueKeys) {
            try {
                // Nuovo formato URL fornito dall'utente per la classifica GC
                const res = await fetch("https://www.wtrl.racing/api/zrl/league/" + season + "/" + key + "/" + race);
                const data = await res.json();
                const payload = data.payload || data;
                if (payload) {
                    results.push({ key, data: payload });
                    console.log("✅ GC " + key + ": scaricato.");
                }
            } catch (e) { console.error("❌ Errore su " + key, e); }
        }
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "zrl_gc_standings_s" + season + "_r" + race + ".json";
        a.click();
        console.log("✅ File Classifica Generale scaricato!");
    })();`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
                            <span className="text-[9px] font-black text-inox-orange uppercase tracking-[0.2em]">Data Pipeline</span>
                        </div>
                        <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Active: {activeRound?.name || '---'}</span>
                        </div>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
                        INGEST <span className="text-zinc-700">RESULTS</span>
                    </h1>
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Step 1: Script GARA */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-inox-cyan/10 rounded-xl text-inox-cyan border border-inox-cyan/20">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic text-white tracking-tight">1a. Risultati Gara</h3>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase leading-relaxed h-12">
                        Scarica i punti della singola tappa per il calcolo delle performance.
                    </p>
                    <div className="relative">
                        <pre className="bg-black/50 border border-zinc-800 p-6 rounded-2xl text-[10px] text-inox-cyan overflow-x-auto custom-scrollbar font-mono leading-relaxed h-48 opacity-60">
                            {scraperScriptRace}
                        </pre>
                        <button 
                            onClick={() => copyToClipboard(scraperScriptRace, 'GARA')}
                            className={`absolute top-4 right-4 px-6 py-3 rounded-xl font-black uppercase text-xs transition-all flex items-center gap-2 shadow-2xl ${
                                copiedScript === 'GARA' ? 'bg-green-500 text-white' : 'bg-inox-cyan text-black hover:scale-105'
                            }`}
                        >
                            {copiedScript === 'GARA' ? <ClipboardCheck size={16} /> : <Download size={16} />}
                            {copiedScript === 'GARA' ? 'COPIATO!' : 'COPIA SCRIPT'}
                        </button>
                    </div>
                </div>

                {/* Step 1b: Script GC */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/20">
                            <Trophy size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic text-white tracking-tight">1b. Classifica GC</h3>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase leading-relaxed h-12">
                        Scarica la classifica generale di divisione per aggiornare la League GC.
                    </p>
                    <div className="relative">
                        <pre className="bg-black/50 border border-zinc-800 p-6 rounded-2xl text-[10px] text-yellow-500/60 overflow-x-auto custom-scrollbar font-mono leading-relaxed h-48 opacity-60">
                            {scraperScriptGC}
                        </pre>
                        <button 
                            onClick={() => copyToClipboard(scraperScriptGC, 'GC')}
                            className={`absolute top-4 right-4 px-6 py-3 rounded-xl font-black uppercase text-xs transition-all flex items-center gap-2 shadow-2xl ${
                                copiedScript === 'GC' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black hover:scale-105'
                            }`}
                        >
                            {copiedScript === 'GC' ? <ClipboardCheck size={16} /> : <Download size={16} />}
                            {copiedScript === 'GC' ? 'COPIATO!' : 'COPIA SCRIPT'}
                        </button>
                    </div>
                </div>

                {/* Step 2: Caricamento File */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 flex flex-col">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-inox-orange/10 rounded-xl text-inox-orange border border-inox-orange/20">
                            <Upload size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic text-white tracking-tight">2. Carica JSON</h3>
                    </div>
                    
                    <div className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-10 transition-all ${
                        file ? 'border-inox-orange bg-inox-orange/5' : 'border-zinc-800 hover:border-zinc-700 bg-black/20'
                    }`}>
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileChange}
                            className="hidden" 
                            id="result-upload"
                        />
                        <label htmlFor="result-upload" className="cursor-pointer flex flex-col items-center gap-4">
                            <div className={`p-5 rounded-full ${file ? 'bg-inox-orange text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                <FileJson size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-white uppercase tracking-widest">
                                    {file ? file.name : 'Seleziona il file JSON'}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Trascina o clicca per caricare</p>
                            </div>
                        </label>
                    </div>

                    <button 
                        disabled={!file || status === 'loading'}
                        onClick={handleUpload}
                        className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-tighter text-lg flex items-center justify-center gap-3 transition-all ${
                            !file || status === 'loading' 
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                                : 'bg-white text-black hover:bg-inox-orange hover:scale-[1.02] shadow-2xl'
                        }`}
                    >
                        {status === 'loading' ? <RefreshCw className="animate-spin" /> : <RefreshCw size={20} />}
                        {status === 'loading' ? 'ELABORAZIONE...' : 'SINCRONIZZA DATI'}
                    </button>

                    {status === 'success' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 animate-in zoom-in duration-300">
                            <CheckCircle2 size={18} />
                            <p className="text-[10px] font-black uppercase">{message}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warning / Info */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
                <Shield size={20} className="text-zinc-600 shrink-0 mt-1" />
                <div className="space-y-1">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest italic">Integrità Pipeline Inox</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">
                        L'ingestore rileva automaticamente se il file contiene risultati di Gara o Classifica Generale (GC). 
                        I dati vengono caricati per il round operativo attivo: <strong>{activeRound?.name || '---'}</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ZRLResultIngestor;
