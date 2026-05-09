import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type { Round, Team, LineupEntry, Athlete } from '../services/types';
import { 
  Users, UserCheck, Shield, AlertTriangle, Info, CheckCircle2, 
  XCircle, HelpCircle, Camera, Share2, MapPin, Calendar, 
  Activity, TrendingUp, Zap, ChevronRight, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface RosterBuilderProps {
  isEmbedded?: boolean;
}

const RosterBuilder: React.FC<RosterBuilderProps> = ({ isEmbedded = false }) => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
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
      const [roundsData, teamsData] = await Promise.all([
        api.getRounds(),
        api.getTeams()
      ]);
      setRounds(roundsData);
      setTeams(teamsData);
      
      if (roundsData.length > 0) setSelectedRound(roundsData[0].id);
      if (teamsData.length > 0) setSelectedTeam(teamsData[0].id);
    } catch (e: any) {
      setError(e.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeamData = useCallback(async () => {
    if (selectedTeam === null || selectedRound === null) return;
    setLoading(true);
    try {
      const [rosterData, lineupData] = await Promise.all([
        api.getRoster(selectedTeam, selectedRound),
        api.getLineup(selectedRound)
      ]);
      setRoster(rosterData);
      setLineup(lineupData.filter(e => e.team_id === selectedTeam));
    } catch (e: any) {
      setError(e.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, selectedRound]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const addToLineup = async (athlete: Athlete) => {
    if (selectedRound === null || selectedTeam === null) return;
    
    if (lineup.length >= 6) {
      setError('Limite Lineup raggiunto: massimo 6 corridori per gara.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const entry: LineupEntry = {
        round_id: selectedRound,
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
      
      setLineup(prev => [...prev, { ...entry, athlete_name: athlete.name }]);
    } catch (e: any) {
      setError(e.message || 'Atleta già schierato in un’altra squadra per questo round.');
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
          logging: false,
          backgroundColor: '#050505',
        });
        const link = document.createElement('a');
        link.download = `lineup_${teams.find(t => t.id === selectedTeam)?.name}_R${rounds.find(r => r.id === selectedRound)?.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error("Capture error:", e);
      }
    }
  };

  if (loading && rounds.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">
        Caricamento War Room...
      </div>
    </div>
  );

  const currentTeam = teams.find(t => t.id === selectedTeam);
  const currentRound = rounds.find(r => r.id === selectedRound);

  return (
    <div className={`transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0 overflow-hidden' : 'space-y-8'}`}>
      
      {/* HEADER (Only if not embedded or snapshot) */}
      {!isEmbedded && !snapshotMode && (
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-zinc-800 pb-8 gap-6 px-6 pt-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-orange-500" size={16} />
              <span className="text-orange-500 font-black text-xs tracking-[0.3em] uppercase italic">Capitancy Operations</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none text-white uppercase">
              Roster <span className="text-zinc-600">Manager</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Team</label>
              <select 
                value={selectedTeam || ''} 
                onChange={(e) => setSelectedTeam(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all w-full shadow-xl"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} (Cat {t.category})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Round</label>
              <select 
                value={selectedRound || ''} 
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all w-full shadow-xl"
              >
                {rounds.map(r => (
                  <option key={r.id} value={r.id}>{r.name} - {new Date(r.date).toLocaleDateString('it-IT')}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setSnapshotMode(true)}
              className="p-4 bg-white text-black rounded-2xl hover:bg-orange-500 transition-all shadow-xl self-end"
            >
              <Camera size={18} />
            </button>
          </div>
        </header>
      )}

      {/* EMBEDDED CONTROLS (Only if embedded and not snapshot) */}
      {isEmbedded && !snapshotMode && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/30 p-4 rounded-3xl border border-zinc-800/50 mx-6">
           <div className="flex gap-4 w-full sm:w-auto">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Select Team</span>
                <select value={selectedTeam || ''} onChange={(e) => setSelectedTeam(Number(e.target.value))} className="bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl px-4 py-2 text-xs outline-none focus:border-orange-500">
                   {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Select Round</span>
                <select value={selectedRound || ''} onChange={(e) => setSelectedRound(Number(e.target.value))} className="bg-zinc-950 border border-zinc-800 text-white font-bold rounded-xl px-4 py-2 text-xs outline-none focus:border-orange-500">
                   {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
           </div>
           <button onClick={() => setSnapshotMode(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black italic rounded-xl hover:bg-orange-500 transition-all text-xs uppercase shadow-lg">
             <Camera size={14} /> Snapshot Mode
           </button>
        </div>
      )}

      {error && !snapshotMode && (
        <div className="mx-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <div ref={captureRef} className={`${snapshotMode ? 'w-[1080px] h-[1080px] bg-[#050505] p-12 flex flex-col justify-center border-[20px] border-zinc-900 mx-auto' : 'grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 pb-12'}`}>
        
        {/* SNAPSHOT HEADER */}
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

        {/* LINEUP SECTION (TACTICAL CARD) */}
        <div className={`${snapshotMode ? 'w-full' : 'lg:col-span-7'}`}>
          <section className={`bg-zinc-950 rounded-[3rem] border border-zinc-900 overflow-hidden shadow-2xl h-full flex flex-col`}>
            <div className="p-10 bg-zinc-900/50 border-b border-zinc-900 flex justify-between items-start">
              <div>
                <p className="text-orange-500 font-black text-[10px] tracking-[0.3em] uppercase mb-2">Starting Roster</p>
                <h2 className="text-4xl font-black italic text-white uppercase leading-none tracking-tighter">
                  {currentTeam?.name || 'Squadra'}
                </h2>
                <div className="flex items-center gap-4 mt-4 text-zinc-500">
                   <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <MapPin size={12} className="text-zinc-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{currentRound?.world || 'Watopia'}</span>
                   </div>
                   <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <Calendar size={12} className="text-zinc-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{currentRound ? new Date(currentRound.date).toLocaleDateString('it-IT') : 'TBD'}</span>
                   </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase border-2 ${
                  lineup.length >= 4 && lineup.length <= 6 
                  ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                  : "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_20px_rgba(252,103,25,0.1)]"
                }`}>
                  {lineup.length}/6 Riders
                </div>
                {currentTeam?.category && (
                  <span className="bg-white text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg">Cat {currentTeam.category}</span>
                )}
              </div>
            </div>

            <div className="p-10 flex-1">
              <div className="grid grid-cols-2 gap-6 h-full content-start">
                {lineup.map((entry, idx) => (
                  <motion.div 
                    key={entry.athlete_id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] group hover:border-orange-500 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <Zap size={60} />
                    </div>
                    
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-black border border-zinc-800 flex items-center justify-center text-orange-500 font-black text-2xl shadow-xl overflow-hidden">
                        {entry.athlete_name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <span className="text-xl font-black text-white uppercase italic tracking-tighter block group-hover:text-orange-500 transition-colors leading-none">{entry.athlete_name}</span>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Confirmed Starter</span>
                        </div>
                      </div>
                    </div>

                    {!snapshotMode && (
                      <button 
                        onClick={() => removeFromLineup(entry)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-700 hover:text-red-500 hover:border-red-500 transition-all z-20"
                        disabled={saving}
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                ))}
                
                {!snapshotMode && Array.from({ length: Math.max(0, 6 - lineup.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-2 border-dashed border-zinc-900 rounded-[2.5rem] p-6 flex flex-col items-center justify-center opacity-30 gap-2">
                    <UserCheck size={24} className="text-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">Add Rider</span>
                  </div>
                ))}

                {snapshotMode && Array.from({ length: Math.max(0, 6 - lineup.length) }).map((_, i) => (
                  <div key={`empty-snap-${i}`} className="bg-zinc-950/50 border border-zinc-900/50 rounded-[2.5rem] p-6 flex items-center justify-center opacity-10">
                    <div className="w-12 h-2 bg-zinc-800 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* ROUTE INFO (Snapshot only) */}
            {snapshotMode && currentRound && (
              <div className="px-10 py-8 bg-zinc-900/30 border-t border-zinc-900 grid grid-cols-3 gap-8">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Route</span>
                    <span className="text-base font-black text-white uppercase italic truncate">{currentRound.route}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Distance</span>
                    <span className="text-base font-black text-white italic">{currentRound.distance}km</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Elevation</span>
                    <span className="text-base font-black text-white italic">{currentRound.elevation}m</span>
                 </div>
              </div>
            )}
          </section>
        </div>

        {/* ROSTER SECTION (Hidden in snapshot) */}
        {!snapshotMode && (
          <div className="lg:col-span-5">
            <section className="bg-zinc-950/50 rounded-[3rem] border border-zinc-900 overflow-hidden sticky top-6">
              <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                    <Users size={20} />
                  </div>
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
                    Team Pool
                  </h2>
                </div>
                <span className="bg-zinc-900 text-zinc-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {roster.length} Available
                </span>
              </div>

              <div className="p-6 max-h-[700px] overflow-y-auto custom-scrollbar space-y-3">
                {[...roster].sort((a, b) => a.name.localeCompare(b.name)).map(athlete => {
                  const inLineup = isAthleteInLineup(athlete.zwid);
                  const status = (athlete as any).availability_status;
                  return (
                    <motion.button
                      key={athlete.zwid}
                      disabled={inLineup || saving}
                      whileHover={!inLineup ? { x: 4 } : {}}
                      onClick={() => addToLineup(athlete)}
                      className={`w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all text-left ${
                        inLineup 
                          ? "bg-zinc-950 border-zinc-900 opacity-40 grayscale cursor-not-allowed" 
                          : "bg-zinc-900 border-zinc-800 hover:border-orange-500/50 active:scale-95 shadow-xl group"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                            inLineup ? "bg-zinc-800 text-zinc-600" : "bg-zinc-800 text-orange-500 group-hover:bg-orange-500 group-hover:text-black"
                          }`}>
                            {athlete.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-zinc-950 rounded-full p-1 border border-zinc-900 shadow-lg">
                            {getAvailabilityIcon(status)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1.5">{athlete.name}</p>
                          <div className="flex items-center gap-2.5">
                             <span className="px-2 py-0.5 bg-zinc-950 rounded text-[8px] font-black text-zinc-500 border border-zinc-800 uppercase tracking-widest">CAT {athlete.category || 'N/A'}</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${
                               status === 'available' ? 'text-green-500' : 
                               status === 'unavailable' ? 'text-red-500' : 
                               status === 'tentative' ? 'text-orange-500' : 'text-zinc-700'
                             }`}>
                               {status || 'No RSVP'}
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                        {inLineup ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <ChevronRight size={18} className="text-zinc-700 group-hover:text-orange-500" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* SNAPSHOT FOOTER */}
        {snapshotMode && (
          <div className="absolute bottom-12 left-12 flex items-center gap-3">
             <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                <Info size={16} className="text-orange-500" />
             </div>
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Strategy developed by Inoxteam Command Center</p>
          </div>
        )}
      </div>

      {/* --- EXIT & SAVE BUTTONS --- */}
      {snapshotMode && (
        <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
          <button
            onClick={() => setSnapshotMode(false)}
            className="px-8 py-4 bg-zinc-800 text-white font-black italic rounded-full shadow-xl hover:scale-110 transition-all uppercase text-sm tracking-tighter"
          >
            EXIT
          </button>
          <button
            onClick={handleCapture}
            className="px-8 py-4 bg-orange-500 text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter"
          >
            SAVE SNAPSHOT
          </button>
        </div>
      )}
    </div>
  );
};

export default RosterBuilder;
