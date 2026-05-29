import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type { Team, LineupEntry, Athlete } from '../services/types';
import { useActiveRound } from '../context/ActiveRoundContext';
import RaceSelector from '../components/admin/RaceSelector';
import { 
  Users, UserCheck, Shield, AlertTriangle, Info, CheckCircle2, 
  XCircle, HelpCircle, Camera, Zap, ChevronRight, Plus, Trash2, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface LineupBuilderProps {
  isEmbedded?: boolean;
}

const LineupBuilder: React.FC<LineupBuilderProps> = ({ isEmbedded = false }) => {
  const { activeRound } = useActiveRound();
  const [selectedRace, setSelectedRace] = useState<any | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  
  const [roster, setRoster] = useState<Athlete[]>([]);
  const [lineup, setLineup] = useState<LineupEntry[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotMode, setSnapshotMode] = useState(false);
  
  const captureRef = useRef<HTMLDivElement>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const teamsData = await api.getTeams();
      setTeams(teamsData);
      if (teamsData.length > 0) setSelectedTeam(teamsData[0].id);
    } catch (e: any) {
      setError(e.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeamData = useCallback(async () => {
    if (selectedTeam === null || !activeRound) return;
    setLoading(true);
    try {
      const [rosterData, lineupData] = await Promise.all([
        api.getRoster(selectedTeam, activeRound.id),
        api.getLineup(activeRound.id)
      ]);
      
      console.log("DEBUG: Roster Data Received =", rosterData);
      
      setRoster(rosterData);
      // Filter lineup by team and, if a race is selected, by race
      const filteredLineup = lineupData.filter(e => e.team_id === selectedTeam);
      if (selectedRace) {
          setLineup(filteredLineup.filter(e => e.race_id === selectedRace.id));
      } else {
          setLineup(filteredLineup);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, selectedRace, activeRound]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const addToLineup = async (athlete: Athlete) => {
    if (selectedRace === null || selectedTeam === null || !activeRound) {
        setError("Seleziona una gara prima di schierare un atleta.");
        return;
    }
    
    if (lineup.length >= 6) {
      setError('Limite Lineup raggiunto: massimo 6 corridori per gara.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const entry: LineupEntry = {
        round_id: activeRound.id,
        race_id: selectedRace.id,
        team_id: selectedTeam,
        athlete_id: athlete.zwid,
        role: 'starter',
        status: 'confirmed'
      };
      
      const response = await fetch('/api/lineup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      setLineup(prev => [...prev, { 
        ...entry, 
        athlete_name: athlete.name,
        athlete_avatar: athlete.avatar_url 
      }]);
    } catch (e: any) {
      setError(e.message || 'Atleta già schierato.');
    } finally {
      setSaving(false);
    }
  };

  const removeFromLineup = async (entry: LineupEntry) => {
    setSaving(true);
    setError(null);
    try {
      await api.removeFromLineup(entry.round_id, entry.team_id, entry.athlete_id);
      setLineup(prev => prev.filter(e => e.athlete_id !== entry.athlete_id));
    } catch (e: any) {
      setError(e.message || 'Failed to remove athlete');
    } finally {
      setSaving(false);
    }
  };

  const isAthleteInLineup = (zwid: number) => lineup.some(e => e.athlete_id === zwid);

  const resolveAvatarUrl = (url?: string) => {
    if (!url || url === '' || url.includes('default.png')) return null;
    // If it's already an absolute URL (like Zwift CDN), use it as is
    if (url.startsWith('http')) return url;
    // If it's a relative path from WTRL, prefix it
    if (url.startsWith('/')) return `https://www.wtrl.racing${url}`;
    return url;
  };

  const getAvailabilityIcon = (status?: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 size={12} className="text-green-500" />;
      case 'unavailable': return <XCircle size={12} className="text-red-500" />;
      case 'tentative': return <HelpCircle size={12} className="text-orange-500" />;
      default: return <HelpCircle size={12} className="text-zinc-700" />;
    }
  };

  const handleCapture = async () => {
    if (captureRef.current) {
      try {
        const canvas = await html2canvas(captureRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#050505'
        });
        const link = document.createElement('a');
        link.download = `lineup_${teams.find(t => t.id === selectedTeam)?.name}_R${activeRound?.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error("Capture error:", e);
      }
    }
  };

  if (loading && teams.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">
        Caricamento War Room...
      </div>
    </div>
  );

  const currentTeam = teams.find(t => t.id === selectedTeam);

  return (
    <div className={`transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0 overflow-hidden' : 'space-y-8'}`}>
      {!isEmbedded && !snapshotMode && (
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-zinc-800 pb-6 gap-6 px-6 pt-6 bg-zinc-950/50 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="text-orange-500" size={14} />
              <span className="text-orange-500 font-black text-[9px] tracking-[0.3em] uppercase italic">Capitancy Ops</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-none text-white uppercase">
              Lineup <span className="text-zinc-600">Builder</span>
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full xl:w-auto items-end">
            <div className="md:col-span-4 flex flex-col gap-1 min-w-[180px]">
              <label htmlFor="team-select" className="text-[9px] font-black uppercase text-zinc-500 ml-2">Select Team</label>
              <select 
                id="team-select" 
                value={selectedTeam || ''} 
                onChange={(e) => setSelectedTeam(Number(e.target.value))} 
                className="bg-zinc-900 border border-zinc-800 text-white text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition-all w-full shadow-lg"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} (B)</option>)}
              </select>
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-1 min-w-[280px]">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-2">Select Race</label>
              <div className="h-[44px]">
                <RaceSelector 
                  onRaceSelect={setSelectedRace} 
                  selectedRaceId={selectedRace?.id}
                />
              </div>
            </div>

            <div className="md:col-span-1 flex justify-end">
              <button 
                onClick={() => setSnapshotMode(true)} 
                className="p-3 bg-white text-black rounded-xl hover:bg-orange-500 transition-all shadow-xl"
                title="Capture Snapshot"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
        </header>
      )}

      {error && !snapshotMode && (
        <div className="mx-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            <AlertTriangle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
        </div>
      )}
      
      <div ref={captureRef} className={`${snapshotMode ? 'w-[1080px] h-[1080px] bg-[#050505] p-12 flex flex-col justify-center border-[20px] border-zinc-900 mx-auto relative' : 'grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 pb-12'}`}>
        
        {snapshotMode && (
            <div className="absolute top-12 left-12 flex items-center gap-5">
                <div className="w-20 h-20 bg-orange-500 flex items-center justify-center rounded-[2rem] shadow-[0_0_40px_rgba(252,103,25,0.3)]">
                    <Shield size={40} className="text-black" />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-4xl font-black italic text-white leading-none tracking-tighter uppercase">Inoxteam <span className="text-zinc-700">Tactics</span></h2>
                    <p className="text-orange-500 font-black uppercase tracking-[0.4em] text-sm mt-1">Official Race Lineup</p>
                </div>
            </div>
        )}

        {/* LEFT COLUMN: CURRENT LINEUP */}
        <div className={snapshotMode ? 'w-full' : 'lg:col-span-7'}>
          <section className="bg-zinc-900/40 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-2xl h-full flex flex-col backdrop-blur-sm">
            <div className="p-10 bg-zinc-800/30 border-b border-zinc-800 flex justify-between items-start">
              <div>
                <p className="text-orange-500 font-black text-[10px] tracking-[0.3em] uppercase mb-2">Starting Roster</p>
                <h2 className="text-4xl font-black italic text-white uppercase leading-none tracking-tighter">{currentTeam?.name || 'Squadra'}</h2>
                <div className="flex items-center gap-4 mt-4 text-zinc-400">
                    <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-inner">
                        <LayoutGrid size={12} className="text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{selectedRace?.name || 'Seleziona gara'}</span>
                    </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                  <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase border-2 ${lineup.length >= 4 && lineup.length <= 6 ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_20px_rgba(252,103,25,0.15)]'}`}>
                      {lineup.length}/6 Riders
                  </div>
                  {currentTeam?.category && (
                      <span className="bg-white text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg">Cat {currentTeam.category}</span>
                  )}
              </div>
            </div>
            
            <div className="p-10 flex-1 grid grid-cols-2 gap-6 content-start">
                <AnimatePresence>
                    {lineup.map((entry, idx) => (
                        <motion.div 
                            key={entry.athlete_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between p-6 bg-zinc-900/60 border border-zinc-800 rounded-[2.5rem] group hover:border-orange-500 transition-all relative overflow-hidden shadow-xl"
                        >
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-black border border-zinc-800 flex items-center justify-center text-orange-500 font-black text-2xl shadow-xl overflow-hidden group-hover:border-orange-500/30 transition-all">
                                    {resolveAvatarUrl(entry.athlete_avatar) ? (
                                        <img 
                                            src={resolveAvatarUrl(entry.athlete_avatar)!} 
                                            alt={entry.athlete_name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        entry.athlete_name?.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xl font-black text-white uppercase italic tracking-tighter block group-hover:text-orange-500 transition-colors leading-none">{entry.athlete_name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Confirmed Starter</span>
                                    </div>
                                </div>
                            </div>
                            {!snapshotMode && (
                                <button 
                                    onClick={() => removeFromLineup(entry)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-500 transition-all z-20 shadow-md"
                                    disabled={saving}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, 6 - lineup.length) }).map((_, idx) => (
                    <div 
                        key={`empty-${idx}`}
                        className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-6 flex flex-col items-center justify-center opacity-40 gap-2 hover:opacity-100 hover:border-zinc-700 transition-all group cursor-default"
                    >
                        <Plus size={24} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        <span className="text-[10px] font-black text-zinc-600 group-hover:text-zinc-400 uppercase tracking-[0.2em] transition-colors">Add Rider</span>
                    </div>
                ))}
            </div>

            {snapshotMode && selectedRace && (
                <div className="px-10 py-8 bg-zinc-800/30 border-t border-zinc-800 grid grid-cols-3 gap-8">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Route</span>
                        <span className="text-base font-black text-white uppercase italic truncate">{selectedRace.route}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">World</span>
                        <span className="text-base font-black text-white uppercase italic">{selectedRace.world}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Date</span>
                        <span className="text-base font-black text-white italic">
                            {new Date(selectedRace.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                        </span>
                    </div>
                </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: TEAM POOL (Hidden in Snapshot) */}
        {!snapshotMode && (
            <div className="lg:col-span-5">
                <section className="bg-zinc-900/40 rounded-[3rem] border border-zinc-800 overflow-hidden sticky top-6 shadow-2xl backdrop-blur-sm">
                    <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-800 shadow-inner">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Team Pool</h2>
                        </div>
                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-inner">
                            {roster.length} Available
                        </span>
                    </div>

                    <div className="p-6 max-h-[700px] overflow-y-auto custom-scrollbar space-y-3">
                        {roster.sort((a, b) => a.name.localeCompare(b.name)).map(athlete => {
                            const isAdded = isAthleteInLineup(athlete.zwid);
                            return (
                                <motion.button
                                    key={athlete.zwid}
                                    disabled={isAdded || saving}
                                    whileHover={isAdded ? {} : { x: 4 }}
                                    onClick={() => addToLineup(athlete)}
                                    className={`w-full flex items-center justify-between p-5 rounded-[2.5rem] border transition-all text-left ${isAdded ? 'bg-zinc-950/50 border-zinc-900 opacity-40 grayscale cursor-not-allowed' : 'bg-zinc-900/60 border-zinc-800 hover:border-orange-500/50 active:scale-95 shadow-xl group'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all shadow-lg overflow-hidden ${isAdded ? 'bg-zinc-900 text-zinc-700' : 'bg-zinc-800 text-orange-500 group-hover:bg-orange-500 group-hover:text-black border border-zinc-700 group-hover:border-orange-600'}`}>
                                                {resolveAvatarUrl(athlete.avatar_url) ? (
                                                    <img 
                                                        src={resolveAvatarUrl(athlete.avatar_url)!} 
                                                        alt={athlete.name} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            console.error(`Avatar Load Error for ${athlete.name}:`, resolveAvatarUrl(athlete.avatar_url));
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML = athlete.name.substring(0, 2).toUpperCase();
                                                        }}
                                                    />
                                                ) : (
                                                    athlete.name.substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-zinc-950 rounded-full p-1 border border-zinc-900 shadow-lg">
                                                {getAvailabilityIcon(athlete.availability_status)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1.5 group-hover:text-orange-500 transition-colors">{athlete.name}</p>
                                            <div className="flex items-center gap-2.5">
                                                <span className="px-2 py-0.5 bg-zinc-950 rounded-md text-[8px] font-black text-zinc-500 border border-zinc-800 uppercase tracking-widest shadow-inner">CAT {athlete.category || 'N/A'}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${athlete.availability_status === 'available' ? 'text-green-500' : athlete.availability_status === 'unavailable' ? 'text-red-500' : 'text-orange-500'}`}>
                                                    {athlete.availability_status || 'No RSVP'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner transition-colors group-hover:border-orange-500/30">
                                        {isAdded ? <CheckCircle2 size={16} className="text-green-500" /> : <Plus size={18} className="text-zinc-600 group-hover:text-orange-500" />}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </section>
            </div>
        )}
      </div>

      {snapshotMode && (
          <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
              <button onClick={() => setSnapshotMode(false)} className="px-8 py-4 bg-zinc-800 text-white font-black italic rounded-full shadow-xl hover:scale-110 transition-all uppercase text-sm tracking-tighter">EXIT</button>
              <button onClick={handleCapture} className="px-8 py-4 bg-orange-500 text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter">SAVE SNAPSHOT</button>
          </div>
      )}
    </div>
  );
};

export default LineupBuilder;
