import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Round, Team, LineupEntry, Athlete } from '../services/types';
import { Users, UserCheck, Shield, AlertTriangle, Info, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

const RosterBuilder: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  
  const [roster, setRoster] = useState<Athlete[]>([]);
  const [lineup, setLineup] = useState<LineupEntry[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Effettuo la chiamata API esplicitando il metodo POST
      const response = await fetch('/api/lineup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}` // Aggiungo token se presente
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

  if (loading && rounds.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">
        Caricamento War Room...
      </div>
    </div>
  );

  const currentTeam = teams.find(t => t.id === selectedTeam);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-zinc-800 pb-8 gap-6">
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
            <label htmlFor="teamSelect" className="text-[10px] font-black uppercase text-zinc-500 ml-2">Seleziona Squadra</label>
            <select 
              id="teamSelect"
              name="teamSelect"
              value={selectedTeam || ''} 
              onChange={(e) => setSelectedTeam(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all w-full"
            >
              <option value="" disabled>Scegli una squadra...</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} (Cat {t.category})</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label htmlFor="roundSelect" className="text-[10px] font-black uppercase text-zinc-500 ml-2">Seleziona Round</label>
            <select 
              id="roundSelect"
              name="roundSelect"
              value={selectedRound || ''} 
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all w-full"
            >
              {rounds.map(r => (
                <option key={r.id} value={r.id}>{r.name} - {new Date(r.date).toLocaleDateString('it-IT')}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LINEUP SECTION */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="p-6 bg-zinc-800/50 border-b border-zinc-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic text-white uppercase flex items-center gap-3">
                  <UserCheck className="text-orange-500" /> Lineup di Gara
                </h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">
                  {currentTeam?.name || 'Seleziona Team'} • {rounds.find(r => r.id === selectedRound)?.name}
                </p>
              </div>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${
                lineup.length >= 4 && lineup.length <= 6 
                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                : "bg-orange-500/10 text-orange-500 border-orange-500/20"
              }`}>
                {lineup.length}/6 Riders
              </div>
            </div>

            <div className="p-8">
              {lineup.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Nessun atleta in lineup</p>
                  <p className="text-[10px] text-zinc-700 uppercase mt-2">Aggiungi atleti dal roster del team</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lineup.map(entry => (
                    <div key={entry.athlete_id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-2xl border border-zinc-700 group hover:border-orange-500 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-black font-black text-xs">
                          {entry.athlete_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-black text-white uppercase block">{entry.athlete_name}</span>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">Starter</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromLineup(entry)}
                        className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                        disabled={saving}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 6 - lineup.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-2 border-dashed border-zinc-800 rounded-2xl p-4 flex items-center justify-center opacity-30">
                      <span className="text-[10px] font-black text-zinc-700 uppercase">Slot Vuoto</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ROSTER SECTION */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-black italic text-white uppercase flex items-center gap-3">
                <Users className="text-zinc-500" /> Roster del Team
              </h2>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {roster.length}/12 Riders
              </span>
            </div>

            <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {roster.map(athlete => {
                const inLineup = isAthleteInLineup(athlete.zwid);
                const status = (athlete as any).availability_status;
                return (
                  <button
                    key={athlete.zwid}
                    disabled={inLineup || saving}
                    onClick={() => addToLineup(athlete)}
                    className={`w-full flex items-center justify-between p-4 mb-2 rounded-2xl border transition-all text-left ${
                      inLineup 
                        ? "bg-zinc-950 border-zinc-900 opacity-40 grayscale cursor-not-allowed" 
                        : "bg-zinc-900 border-zinc-800 hover:border-orange-500/50 active:scale-95 shadow-lg"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          inLineup ? "bg-zinc-800 text-zinc-600" : "bg-zinc-800 text-orange-500"
                        }`}>
                          {athlete.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
                          {getAvailabilityIcon(status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase">{athlete.name}</p>
                        <div className="flex items-center gap-2">
                           <p className="text-[9px] font-bold text-zinc-600 uppercase">CAT {athlete.category || 'N/A'}</p>
                           <span className={`text-[8px] font-black uppercase ${
                             status === 'available' ? 'text-green-500' : 
                             status === 'unavailable' ? 'text-red-500' : 
                             status === 'tentative' ? 'text-orange-500' : 'text-zinc-700'
                           }`}>
                             {status || 'No RSVP'}
                           </span>
                        </div>
                      </div>
                    </div>
                    {inLineup ? (
                      <span className="text-[8px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded">Schierato</span>
                    ) : (
                      <span className="text-lg text-zinc-700 group-hover:text-orange-500">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RosterBuilder;
