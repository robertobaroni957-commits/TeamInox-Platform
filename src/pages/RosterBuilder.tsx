import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Round, Team, LineupEntry, Athlete } from '../services/types';

const RosterBuilder: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [lineups, setLineups] = useState<LineupEntry[]>([]);
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
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
    } catch (e: any) {
      setError(e.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoundData = useCallback(async () => {
    if (selectedRound === null) return;
    setLoading(true);
    try {
      const [lineupData, poolData] = await Promise.all([
        api.getLineup(selectedRound),
        api.getAvailableAthletes(selectedRound)
      ]);
      setLineups(lineupData);
      setAvailableAthletes(poolData);
    } catch (e: any) {
      setError(e.message || 'Failed to load round data');
    } finally {
      setLoading(false);
    }
  }, [selectedRound]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadRoundData();
  }, [loadRoundData]);

  const addToLineup = async (athlete: Athlete, teamId: number) => {
    if (selectedRound === null) return;
    setSaving(true);
    try {
      const entry: LineupEntry = {
        round_id: selectedRound,
        team_id: teamId,
        athlete_id: athlete.zwid,
        role: 'starter',
        status: 'confirmed'
      };
      await api.updateLineup(entry);
      // Optimistic update
      setLineups(prev => [...prev, { ...entry, athlete_name: athlete.name }]);
      setAvailableAthletes(prev => prev.filter(a => a.zwid !== athlete.zwid));
    } catch (e: any) {
      setError(e.message || 'Failed to assign athlete');
    } finally {
      setSaving(false);
    }
  };

  const removeFromLineup = async (entry: LineupEntry) => {
    setSaving(true);
    try {
      await api.removeFromLineup(entry.round_id, entry.team_id, entry.athlete_id);
      setLineups(prev => prev.filter(e => !(e.team_id === entry.team_id && e.athlete_id === entry.athlete_id)));
      setAvailableAthletes(prev => [...prev, { zwid: entry.athlete_id, name: entry.athlete_name || 'Rider', category: 'N/A' }]);
    } catch (e: any) {
      setError(e.message || 'Failed to remove athlete');
    } finally {
      setSaving(false);
    }
  };

  if (loading && rounds.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-inox-orange font-black italic text-xl animate-pulse uppercase tracking-[0.2em]">
        War Room Initializing...
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <span className="text-inox-orange font-black text-xs tracking-[0.3em] uppercase italic">Strategic Operations</span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white">
            ROSTER <span className="text-zinc-600">BUILDER</span>
          </h1>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <select 
            value={selectedRound || ''} 
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 outline-none focus:border-inox-orange focus:ring-2 focus:ring-inox-orange/20 transition-all"
          >
            {rounds.map(r => (
              <option key={r.id} value={r.id}>{r.name} - {new Date(r.date).toLocaleDateString('it-IT')}</option>
            ))}
          </select>
          <button 
            className="bg-inox-orange hover:bg-orange-500 text-black px-6 py-3 rounded-xl font-black italic transition-all flex items-center gap-2 transform active:scale-95 uppercase tracking-wider"
          >
            <span className="text-xl">⚡</span> Auto-Generate
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold italic text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {teams.map(team => {
          const teamLineup = lineups.filter(e => e.team_id === team.id);
          return (
            <section key={team.id} className="bg-zinc-900/40 rounded-3xl border border-zinc-800 overflow-hidden flex flex-col group hover:border-zinc-700 transition-all">
              <div className="p-6 bg-zinc-900/60 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic text-white uppercase">{team.name}</h2>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    {team.division || 'DIVISION TBD'} • CAT {team.category}
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const entry = teamLineup[i];
                    return (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold shadow-xl ${entry ? 'bg-inox-cyan text-black border-cyan-400' : 'bg-zinc-800 text-zinc-600'}`}>
                        {entry ? entry.athlete_name?.substring(0, 2).toUpperCase() : '?'}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-6 space-y-3 min-h-[200px]">
                {teamLineup.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Nessun atleta assegnato</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {teamLineup.map(entry => (
                      <div key={entry.athlete_id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
                        <span className="text-xs font-black text-white uppercase truncate">{entry.athlete_name}</span>
                        <button 
                          onClick={() => removeFromLineup(entry)}
                          className="text-red-500 hover:text-red-400 p-1"
                          title="Remove from team"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
                  Lineup Status: {teamLineup.length}/6 Confirmed
                </span>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                  Lock Lineup
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {/* RIDERS POOL */}
      <div className="mt-16 bg-zinc-950/50 p-8 rounded-[2.5rem] border border-zinc-800">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black italic text-white flex items-center gap-4 uppercase">
            <span className="text-inox-orange text-4xl">/</span> Available Pool
          </h2>
          <span className="px-4 py-1 bg-inox-orange/10 text-inox-orange text-xs font-black rounded-full border border-inox-orange/20 uppercase">
            {availableAthletes.length} Riders Ready
          </span>
        </div>
        
        {availableAthletes.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 font-bold italic uppercase tracking-widest">
            Tutti gli atleti disponibili sono stati assegnati.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {availableAthletes.map(athlete => (
              <div key={athlete.zwid} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-inox-cyan transition-all cursor-pointer group flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 mb-3 group-hover:bg-inox-cyan transition-all flex items-center justify-center font-black text-zinc-600 group-hover:text-black">
                  {athlete.name.substring(0, 2).toUpperCase()}
                </div>
                <p className="text-xs font-black text-white uppercase truncate w-full text-center">{athlete.name}</p>
                <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">CAT {athlete.category}</p>
                
                {/* Assignment Dropdown/Menu for quick use */}
                <select 
                  onChange={(e) => {
                    const teamId = Number(e.target.value);
                    if (teamId) addToLineup(athlete, teamId);
                    e.target.value = '';
                  }}
                  className="mt-3 w-full bg-zinc-800 border-none text-[9px] font-black text-inox-cyan uppercase rounded px-2 py-1 outline-none"
                >
                  <option value="">Assegna a...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterBuilder;
