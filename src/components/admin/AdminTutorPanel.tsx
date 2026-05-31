import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Zap, Activity, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';
import { useZRLReality } from '../../services/ZRLRealityProvider';

export default function AdminTutorPanel() {
    const navigate = useNavigate();
    const { activeRound, isProcessing, selectedSeasonCode, rounds, activeRaces } = useRoundControl();
    const { teams, roster } = useZRLReality();

    const teamsList = teams?.data || [];
    const rosterList = roster?.data || [];
    const roundsList = rounds || [];
    
    // Deduplicazione gare per nome (percorso unico per evento)
    const uniqueRaces = activeRaces ? Array.from(new Set(activeRaces.map(r => r.name))) : [];
    const racesCount = uniqueRaces.length;
    
    const getNextStep = () => {
        if (isProcessing) return "Attendi il completamento della sincronizzazione";
        
        // Percorso Logico di Inizializzazione (Riordinato per Priorità Strutturale)
        
        // 1. Rounds (Stagione/Campionato) - Definisce il calendario macro
        if (roundsList.length === 0) {
            return "1. Configura Stagione: Esegui Bootstrap dei Rounds";
        }
        
        // 2. Races (Gare del Round attivo) - Definisce i dettagli dei percorsi
        if (racesCount === 0) {
            return `2. Struttura pronta: Importa Gare per Round ${activeRound?.wtrl_id || 'Selezionato'}`;
        }

        // 3. Squadre - Definisce chi partecipa
        if (teamsList.length === 0) {
            return "3. Campionato pronto: Sincronizza le Squadre InoxTeam";
        }
        
        // 4. Roster - Associa gli atleti alle squadre
        if (rosterList.length === 0) {
            return "4. Squadre caricate: Build Lineup Atleti (WTRL)";
        }

        // 5. Attivazione
        if (activeRound?.sync_state === 'CREATED' || activeRound?.sync_state === 'PENDING') {
            return `5. Dati allineati: Attiva Round ${activeRound?.wtrl_id} per la gestione`;
        }

        // 6. Operatività
        if (activeRound?.sync_state === 'COMPLETED') {
            return `Round ${activeRound?.wtrl_id} Operativo. Monitora Lineup e Risultati.`;
        }

        return `Gestione Round WTRL: ${activeRound?.wtrl_id || '---'}`;
    };

    const handleAction = () => {
        // Logica di navigazione basata sullo step
        if (teamsList.length === 0 || rosterList.length === 0) {
            return navigate('/zrl-operations');
        }
        
        if (roundsList.length === 0 || racesList.length === 0) {
            // Rimaniamo qui o scrolliamo alla sezione import
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            return;
        }

        if (activeRound && activeRound.status !== 'IDLE') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } else {
            navigate('/admin/season-init');
        }
    };

    return (
        <div className="h-full bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col lg:flex-row gap-10 shadow-2xl overflow-hidden">
            
            {/* Sezione 1: System Status */}
            <div className="flex-1 lg:border-r border-zinc-800 lg:pr-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-zinc-900 rounded-2xl text-zinc-400 shadow-inner">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-white uppercase tracking-widest">System Health</h2>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight mt-0.5 opacity-70">Stato operativo real-time</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <StatusCard 
                        label="Season" 
                        value={(selectedSeasonCode || activeRound?.season_code || "N/A").replace('zrl_', '').toUpperCase()} 
                        active={!!(selectedSeasonCode || activeRound?.season_code)} 
                    />
                    <StatusCard label="Round" value={activeRound?.wtrl_id?.toString() || "---"} active={!!activeRound?.wtrl_id} />
                    <StatusCard label="Races" value={racesCount.toString()} active={racesCount > 0} />
                    <StatusCard label="Pipeline" value={isProcessing ? "Attiva" : "Standby"} active={isProcessing} />
                </div>
            </div>

            {/* Sezione 2: Next Step */}
            <div className="flex-[1.2] flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500 shadow-inner">
                        <Compass size={28} />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-white uppercase tracking-widest">Operational Guidance</h2>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight mt-0.5 opacity-70">Percorso di inizializzazione</p>
                    </div>
                </div>

                <button 
                    onClick={handleAction}
                    className="w-full group p-10 rounded-[2.5rem] border transition-all flex items-center justify-between bg-gradient-to-br from-orange-600 to-orange-500 border-orange-400 hover:shadow-[0_0_50px_-10px_rgba(249,115,22,0.6)] active:scale-[0.98] shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="text-left relative z-10 min-w-0 flex-1">
                        <span className="block text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-2">Step Operativo</span>
                        <span className="text-xl font-black uppercase text-white tracking-tight leading-tight block">
                            {getNextStep()}
                        </span>
                    </div>
                    <div className="p-5 bg-white/20 rounded-full group-hover:scale-110 transition-all shadow-xl relative z-10 border border-white/20 ml-4 shrink-0">
                        <Play size={28} className="text-white fill-white" />
                    </div>
                </button>
            </div>
        </div>
    );
}

function StatusCard({ label, value, active }: { label: string, value: string, active: boolean }) {
    return (
        <div className={`p-5 rounded-2xl border transition-colors min-w-0 ${active ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950 border-zinc-800'}`}>
            <span className="text-[10px] font-black text-zinc-500 uppercase block mb-2 tracking-widest">{label}</span>
            <span className={`text-sm md:text-base font-black uppercase tracking-tight block break-words ${active ? 'text-white' : 'text-zinc-700'}`} title={value}>{value}</span>
        </div>
    );
}
