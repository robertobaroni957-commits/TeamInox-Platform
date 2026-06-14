import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect
} from "react";

interface Round {
  id: number;
  wtrl_id: number;
  name: string;
  season_code: string;
  round_number?: number;
  status?: string;
  races?: any[];
}

interface Team {
  wtrl_team_id: number;
  name: string;
  category: string;
}

interface ActiveRoundContextType {
  rounds: Round[];
  activeRound: Round | null;
  teams: Team[];
  activeTeam: Team | null;
  setRounds: (rounds: Round[]) => void;
  setActiveRound: (round: Round | null) => void;
  setTeams: (teams: Team[]) => void;
  setActiveTeam: (team: Team | null) => void;
  refreshRounds: () => Promise<void>;
  refreshTeams: () => Promise<void>;
}

const ActiveRoundContext = createContext<ActiveRoundContextType | undefined>(undefined);

export function ActiveRoundProvider({ children }: { children: ReactNode }) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeRound, setActiveRoundState] = useState<Round | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);

  // 🔥 SINGLE SOURCE OF TRUTH LOGIC
  const computeActiveRound = (list: Round[]) => {
    if (!list || list.length === 0) return null;

    return (
      list.find(r => r.status === "active") ??
      [...list].sort(
        (a, b) => (b.round_number || 0) - (a.round_number || 0)
      )[0] ??
      null
    );
  };

  // 🔄 AUTO SYNC ACTIVE ROUND WHEN ROUNDS CHANGE
  useEffect(() => {
    if (!activeRound) {
        const computed = computeActiveRound(rounds);
        setActiveRoundState(computed);
    }
  }, [rounds, activeRound]);

  const refreshTeams = async () => {
    try {
        const token = localStorage.getItem('inox_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch("/api/teams", { headers });
        const data = await res.json();
        const teamList = data.teams || (Array.isArray(data) ? data : []);
        
        if (Array.isArray(teamList)) {
            // Normalize team list to ensure wtrl_team_id is present
            const normalizedTeams = teamList.map((t: any) => ({
                ...t,
                wtrl_team_id: t.wtrl_team_id || t.id
            }));
            
            setTeams(normalizedTeams);
            
            // Default to first team if available
            if (normalizedTeams.length > 0 && !activeTeam) {
                setActiveTeamState(normalizedTeams[0]);
            }
        }
    } catch (err) {
        console.error("Failed to fetch teams:", err);
    }
  };

  const refreshRounds = async () => {
    try {
      console.log("ActiveRoundContext: Fetching /api/rounds...");
      const token = localStorage.getItem('inox_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch("/api/rounds", { headers });
      const data = await res.json();
      console.log("ActiveRoundContext: API Response =", data);

      if (!Array.isArray(data)) {
        console.warn("Invalid rounds payload:", data);
        return;
      }

      setRounds(data);
    } catch (err) {
      console.error("Failed to fetch rounds:", err);
    }
  };

  // 🚀 INIT LOAD
  useEffect(() => {
    refreshRounds();
    refreshTeams();
  }, []);

  const setActiveRound = (round: Round | null) => {
    setActiveRoundState(round);
  };

  const setActiveTeam = (team: Team | null) => {
    setActiveTeamState(team);
  };

  const value = useMemo(
    () => ({
      rounds,
      activeRound,
      teams,
      activeTeam,
      setRounds,
      setActiveRound,
      setTeams,
      setActiveTeam,
      refreshRounds,
      refreshTeams
    }),
    [rounds, activeRound, teams, activeTeam]
  );

  return (
    <ActiveRoundContext.Provider value={value}>
      {children}
    </ActiveRoundContext.Provider>
  );
}

export function useActiveRound() {
  const context = useContext(ActiveRoundContext);
  if (!context) {
    throw new Error("useActiveRound must be used within ActiveRoundProvider");
  }
  return context;
}