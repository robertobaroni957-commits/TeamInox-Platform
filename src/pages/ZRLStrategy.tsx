import React, { useState, useEffect } from 'react';
import { 
    MapPin, 
    Zap, 
    Activity, 
    ChevronRight, 
    BarChart3, 
    Wind, 
    ArrowUpRight,
    Trophy,
    Calendar,
    LayoutGrid,
    Info,
    RefreshCw,
    ExternalLink,
    Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoundControlProvider, useRoundControl } from './admin/RoundControlContext';

/**
 * ZRLStrategy - Tactical briefing room for course analysis and strategy sharing.
 * Displays details of each race in a round, per category.
 */
function ZRLStrategyContent() {
    const { rounds, selectedWtrlId, activeRound, activeRaces } = useRoundControl();
    const [selectedCategory, setSelectedCategory] = useState<'A' | 'C'>('A');
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: 'A', label: 'Categories A / B', color: 'bg-red-500' },
        { id: 'C', label: 'Categories C / D', color: 'bg-emerald-500' }
    ];

    // Filter races for the selected category
    const categoryRaces = activeRaces.filter(r => r.category === selectedCategory);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 bg-zinc-950 min-h-screen text-gray-200">
            
            {/* HEADER */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-900 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#fc6719]/10 rounded-xl text-[#fc6719] border border-[#fc6719]/20">
                            <Zap size={24} />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Operational Intel</h2>
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
                        TACTICAL <span className="text-zinc-800 text-outline">BRIEFING</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest max-w-xl">
                        Analisi tecnica dei percorsi e pianificazione strategica per il {activeRound?.name || 'Round Attivo'}.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as any)}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    selectedCategory === cat.id 
                                    ? 'bg-white text-black shadow-lg shadow-white/5' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* RACE GRID */}
            <div className="grid grid-cols-1 gap-12">
                {categoryRaces.length > 0 ? categoryRaces.map((race, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={race.id}
                        className="group bg-[#090a10] border border-zinc-800 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[450px] shadow-2xl hover:border-zinc-700 transition-all"
                    >
                        {/* Course Visual */}
                        <div className="lg:w-2/5 relative bg-zinc-900 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                            <div className="absolute inset-0 flex flex-col justify-end p-10 z-20">
                                <span className="text-[10px] font-black text-[#fc6719] uppercase tracking-[0.4em] mb-2">{race.world}</span>
                                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{race.route}</h3>
                                <div className="flex gap-4">
                                    {(() => {
                                        const json = JSON.parse(race.raw_json || '{}');
                                        // Calcolo robusto basato su lapDistance/Ascent direttamente dal JSON
                                        const laps = race.laps || 1;
                                        const totalDist = (( (json.lapDistanceInMeters || 0) * laps) + (json.leadinDistanceInMeters || 0)) / 1000;
                                        const totalElev = ((json.lapAscentInMeters || 0) * laps) + (json.leadinAscentInMeters || 0);
                                        
                                        return (
                                            <>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400">
                                                    <Activity size={14} className="text-zinc-600" /> {totalDist > 0 ? totalDist.toFixed(1) : '---'} KM
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400">
                                                    <ArrowUpRight size={14} className="text-zinc-600" /> {totalElev > 0 ? Math.round(totalElev) : '---'} M
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-1000">
                                <img 
                                    src={`https://zwiftinsider.com/wp-content/uploads/world-${race.world.toLowerCase()}.jpg`} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"}
                                />
                            </div>
                        </div>

                        {/* Tactical Details */}
                        <div className="flex-1 p-10 lg:p-12 flex flex-col justify-between">
                            <div className="space-y-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Event Timing</p>
                                        <p className="text-lg font-black text-white italic">
                                            {(() => {
                                                const json = JSON.parse(race.raw_json || '{}');
                                                return json.eventDate ? new Date(json.eventDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Data non disponibile';
                                            })()}
                                        </p>
                                    </div>
                                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        Race {idx + 1}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DetailBox label="Format" value={JSON.parse(race.raw_json || '{}').raceFormat?.replace('wtrl', '')?.toUpperCase() || 'RACE'} />
                                    <DetailBox label="Laps" value={race.laps || 1} />
                                    <DetailBox label="Difficulty" value={`${JSON.parse(race.raw_json || '{}').courseDifficulty}/5`} />
                                    <DetailBox label="Pace" value="10/10" />
                                </div>

                                <div className="space-y-4 pt-6 border-t border-zinc-900">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                        <BarChart3 size={16} className="text-[#fc6719]" /> Tactical Segments
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {JSON.parse(race.raw_json || '{}').segments?.map((seg: any) => (
                                            <div key={seg.segmentId} className="px-5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-inner group/seg hover:border-zinc-700 transition-all">
                                                <div className={`w-2 h-2 rounded-full ${seg.segmentName.includes('Sprint') ? 'bg-inox-cyan shadow-[0_0_15px_rgba(0,188,212,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`} />
                                                <span className="text-xs font-black text-white uppercase italic tracking-tight">{seg.segmentName}</span>
                                                <span className="text-sm font-black text-[#fc6719] bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">x{seg.segmentVisits}</span>
                                            </div>
                                        )) || <p className="text-sm text-zinc-700 italic uppercase font-bold">Nessun segmento speciale mappato</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <a 
                                    href={`https://zwiftinsider.com/route/${race.route.toLowerCase().replace(/ /g, '-')}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-5 bg-white text-black font-black italic uppercase rounded-2xl text-sm tracking-widest hover:bg-[#fc6719] hover:text-white transition-all shadow-xl text-center flex items-center justify-center gap-2 group/btn"
                                >
                                    Course Analysis
                                    <ExternalLink size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </a>
                                <button className="p-5 bg-zinc-900 text-zinc-500 hover:text-white rounded-2xl border border-zinc-800 transition-all">
                                    <Share2Icon size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-40 text-center space-y-6">
                        <MapIcon size={80} className="text-zinc-900 mx-auto" />
                        <h3 className="text-2xl font-black text-zinc-700 uppercase italic">Intelligence Room Offline</h3>
                        <p className="text-zinc-800 font-bold uppercase text-xs">Importa i dati del Round nel setup per abilitare la pianificazione tattica.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailBox({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-900 shadow-inner group/box hover:border-zinc-700 transition-all">
            <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors">{label}</span>
            <span className="text-xl font-black text-white uppercase italic tracking-tighter">{value}</span>
        </div>
    );
}

const Share2Icon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
);

export default function ZRLStrategy() {
    return (
        <RoundControlProvider>
            <ZRLStrategyContent />
        </RoundControlProvider>
    );
}
