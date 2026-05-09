import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Clock, Zap, CheckCircle2, ChevronRight, AlertCircle, Heart } from 'lucide-react';

interface SuggestedTeam {
  slot_id: string;
  slot_name: string;
  category: string;
  count: number;
  favorite_count: number;
  acceptable_count: number;
  athletes: { zwid: number; name: string; level: number }[];
}

const RosterSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmedProposals, setConfirmedProposals] = useState<SuggestedTeam[]>([]); // State for confirmed proposals
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // State for validation errors

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // State for total preferences
  const [totalPreferences, setTotalPreferences] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getRosterSuggestions();
        if (data.success) {
          setSuggestions(data.viableTeams);
          // Populate filter options
          const uniqueCategories = [...new Set(data.viableTeams.map(s => s.category))].sort();
          const uniqueSlots = [...new Set(data.viableTeams.map(s => s.slot_name))].sort();
          setAvailableCategories(uniqueCategories);
          setAvailableSlots(uniqueSlots);
          
          // Capture total_expressed_preferences from the API response
          if (data.total_expressed_preferences !== undefined) {
            setTotalPreferences(data.total_expressed_preferences);
          }
        } else {
          setError(data.error || 'Errore durante il recupero dei suggerimenti');
        }
      } catch (err: any) {
        setError(err.message || 'Errore di connessione');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handler to add a selected team proposal to the confirmed list, allowing up to 2 per slot/category
  const handleConfigureTeam = (selectedTeam: SuggestedTeam) => {
    // Count how many confirmed proposals already exist for the same slot and category.
    const countForSlotAndCategory = confirmedProposals.filter(
      (proposal) => proposal.slot_id === selectedTeam.slot_id && proposal.category === selectedTeam.category
    ).length;

    // If we can still add another team for this slot/category (up to 2)
    if (countForSlotAndCategory < 2) {
      setConfirmedProposals([...confirmedProposals, selectedTeam]);
      console.log(`Proposal confirmed for Slot: ${selectedTeam.slot_name}, Category: ${selectedTeam.category}. Total confirmed for this slot/cat: ${countForSlotAndCategory + 1}`);
      // Optionally, provide user feedback here, e.g., a toast notification
    } else {
      console.log(`Cannot add more than 2 teams for Slot: ${selectedTeam.slot_name}, Category: ${selectedTeam.category}. Already have ${countForSlotAndCategory} confirmed.`);
      // Optionally, provide user feedback here, e.g., a toast notification indicating the limit has been reached.
    }
  };

  // Function to validate all confirmed proposals against the rules
  const validateRosters = (): string[] => {
    const errors: string[] = [];
    // Map to track runner assignments: Map<runnerId, Map<category, count>>
    const runnerCategoryAssignments = new Map<number, Map<string, number>>(); 

    // Rule 1: Min/Max runners per team (4-12)
    confirmedProposals.forEach((proposal, index) => {
      const teamIdentifier = `Proposta ${index + 1} (Slot: ${proposal.slot_name}, Cat: ${proposal.category})`;
      if (proposal.athletes.length < 4) {
        errors.push(`${teamIdentifier}: Minimo 4 corridori richiesti, trovati ${proposal.athletes.length}.`);
      }
      if (proposal.athletes.length > 12) {
        errors.push(`${teamIdentifier}: Massimo 12 corridori permessi, trovati ${proposal.athletes.length}.`);
      }
    });

    // Rule 2: Runner max 2 teams of their own category
    confirmedProposals.forEach((proposal) => {
      const teamCategory = proposal.category; // Category of the slot/team being proposed

      proposal.athletes.forEach(athlete => {
        const runnerId = athlete.zwid;
        // Assuming athlete.level is the runner's primary category. Convert to string for consistent map keys.
        const runnerPrimaryCategory = String(athlete.level); 

        // Initialize map for runner if not present
        if (!runnerCategoryAssignments.has(runnerId)) {
          runnerCategoryAssignments.set(runnerId, new Map<string, number>());
        }
        const assignmentsForRunner = runnerCategoryAssignments.get(runnerId)!;

        // Only count assignments if the proposal's category matches the runner's primary category
        if (teamCategory === runnerPrimaryCategory) {
          const currentCount = assignmentsForRunner.get(runnerPrimaryCategory) || 0;
          const newCount = currentCount + 1;
          assignmentsForRunner.set(runnerPrimaryCategory, newCount);

          if (newCount > 2) {
            errors.push(`Corridore "${athlete.name}" (ID: ${runnerId}) eccede il limite di 2 team nella categoria ${runnerPrimaryCategory}. Assegnato a ${newCount} team.`);
          }
        }
      });
    });

    return errors;
  };

  // Handler for the validation button click
  const handleValidationClick = () => {
    const errors = validateRosters();
    setValidationErrors(errors);
    // If no errors, you might proceed to generate the final report or save.
    if (errors.length === 0) {
      console.log("Validation successful. Ready to generate report.");
      // Potentially trigger report generation or save action here
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">
        Analisi preferenze in corso...
      </div>
    </div>
  );

  // Apply filters to suggestions
  const filteredSuggestions = suggestions.filter(suggestion =>
    (selectedCategory === '' || suggestion.category === selectedCategory) &&
    (selectedSlot === '' || suggestion.slot_name === selectedSlot)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-orange-500" size={16} />
            <span className="text-orange-500 font-black text-xs tracking-[0.3em] uppercase italic">Admin Intelligence</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none text-white uppercase">
            Roster <span className="text-zinc-600">Optimizer</span>
          </h1>
          <p className="text-zinc-400 font-bold uppercase text-xs mt-4 tracking-widest italic">
            Distribuzione atleti per Categoria e Slot Orario espressi nel sistema.
          </p>
        </div>
        <div className="bg-zinc-900/60 px-8 py-5 rounded-[2rem] border border-zinc-800 shadow-2xl">
           <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Totale Preferenze</span>
           <span className="text-3xl font-black italic text-orange-500">{totalPreferences}</span>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-6 mb-10 items-center p-6 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 shadow-xl backdrop-blur-sm">
        {/* Category Filter */}
        <div className="flex flex-col gap-1.5">
            <label htmlFor="categoryFilter" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Filtra per Categoria</label>
            <select 
                id="categoryFilter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-5 py-2.5 text-xs outline-none focus:border-orange-500 transition-all shadow-inner"
            >
                <option value="">Tutte le Categorie</option>
                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </div>

        {/* Slot Filter */}
        <div className="flex flex-col gap-1.5">
            <label htmlFor="slotFilter" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Filtra per Slot Orario</label>
            <select 
                id="slotFilter"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-5 py-2.5 text-xs outline-none focus:border-orange-500 transition-all shadow-inner"
            >
                <option value="">Tutti gli Slot</option>
                {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-4">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {filteredSuggestions.length === 0 ? (
        <div className="bg-zinc-900/30 rounded-[3rem] border border-zinc-800 border-dashed p-24 text-center">
          <Users className="mx-auto text-zinc-800 mb-6" size={64} />
          <p className="text-zinc-600 font-black uppercase italic tracking-widest text-2xl">Nessun dato disponibile</p>
          <p className="text-zinc-700 text-xs mt-3 uppercase font-bold tracking-[0.2em] max-w-sm mx-auto">Gli atleti devono inserire almeno una preferenza positiva (💚 o 💛) per attivare l'ottimizzatore.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredSuggestions.map((team, idx) => (
            <section key={idx} className="bg-zinc-900/40 rounded-[3rem] border border-zinc-800 overflow-hidden hover:border-orange-500/40 transition-all group shadow-2xl backdrop-blur-sm">
              <div className="p-8 bg-zinc-800/30 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-orange-500/30 transition-all shadow-inner">
                    <span className="text-4xl font-black italic text-orange-500">{team.category}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic text-white uppercase leading-tight tracking-tighter">Pool Suggerito</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock size={12} className="text-zinc-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{team.slot_name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-4xl font-black italic text-white leading-none">{team.count}</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Atleti Totali</span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
                  <div className="flex gap-5">
                    <div className="flex items-center gap-2">
                      <Heart size={12} className="fill-green-500 text-green-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{team.favorite_count} Favorite</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={12} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{team.acceptable_count} Acceptable</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                  {[...team.athletes].sort((a, b) => a.name.localeCompare(b.name)).map(athlete => (
                    <div key={athlete.zwid} className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all shadow-md group/rider">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 flex-shrink-0 group-hover/rider:text-orange-500 transition-colors">
                          {athlete.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-black text-zinc-200 uppercase truncate italic tracking-tight">{athlete.name}</span>
                      </div>
                      <Heart size={12} className={`${athlete.level === 2 ? 'fill-green-500 text-green-500' : 'fill-yellow-500 text-yellow-500'}`} />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleConfigureTeam(team)} 
                  className="w-full mt-8 py-5 bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-black rounded-[1.5rem] font-black italic uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 group/btn shadow-xl border border-zinc-700 hover:border-orange-600"
                >
                  Configura Team <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Section to display confirmed proposals */}
      {confirmedProposals.length > 0 && (
        <section className="mt-16 pt-10 border-t border-zinc-900">
          <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-none text-white uppercase mb-10">
            Proposte <span className="text-zinc-700">Confermate</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {confirmedProposals.map((proposal, idx) => (
              <div key={idx} className="bg-zinc-900/50 rounded-[3rem] border border-zinc-800 overflow-hidden hover:border-orange-500/50 transition-all group p-8 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-orange-500/30 transition-all shadow-inner">
                      <span className="text-4xl font-black italic text-orange-500">{proposal.category}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic text-white uppercase leading-tight tracking-tighter">Proposta Selezionata</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock size={12} className="text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{proposal.slot_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-4xl font-black italic text-white leading-none">{proposal.count}</span>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Atleti</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-3 custom-scrollbar">
                  {[...proposal.athletes].sort((a, b) => a.name.localeCompare(b.name)).map(athlete => (
                    <div key={athlete.zwid} className="flex items-center justify-between p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all shadow-md">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500 flex-shrink-0">
                          {athlete.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-black text-zinc-300 uppercase truncate italic tracking-tight">{athlete.name}</span>
                      </div>
                      <Heart size={12} className={`${athlete.level === 2 ? 'fill-green-500 text-green-500' : 'fill-yellow-500 text-yellow-500'}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Validation Section */}
          <div className="mt-16 pt-10 border-t border-zinc-900">
            <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-none text-white uppercase mb-10">
              Validazione <span className="text-zinc-700">Regolamento</span>
            </h2>
            <button 
              onClick={handleValidationClick}
              className="px-10 py-5 bg-orange-500 hover:bg-orange-600 text-black rounded-[1.5rem] font-black italic uppercase text-sm tracking-widest transition-all shadow-2xl hover:scale-[1.02]"
            >
              Valida & Genera Report
            </button>

            {validationErrors.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-8 bg-red-500/10 border border-red-500/30 text-red-400 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest flex flex-col gap-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <AlertCircle size={28} />
                  <h3 className="text-xl font-black italic tracking-tighter">Errori di Validazione Rilevati</h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="bg-black/20 p-4 rounded-xl border border-red-500/20 list-none">{error}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            {validationErrors.length === 0 && confirmedProposals.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 p-8 bg-green-500/10 border border-green-500/30 text-green-400 rounded-[2.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black italic tracking-tighter">Mission Ready</h3>
                   <p className="opacity-60">Tutti i roster rispettano i parametri del regolamento ZRL.</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default RosterSuggestions;
