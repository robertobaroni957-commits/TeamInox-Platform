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
  round_number?: number;
  status?: string;
  races?: any[];
}

interface ActiveRoundContextType {
  rounds: Round[];
  activeRound: Round | null;
  setRounds: (rounds: Round[]) => void;
  setActiveRound: (round: Round | null) => void;
  refreshRounds: () => Promise<void>;
}

const ActiveRoundContext = createContext<ActiveRoundContextType | undefined>(undefined);

export function ActiveRoundProvider({ children }: { children: ReactNode }) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeRound, setActiveRoundState] = useState<Round | null>(null);

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
    const computed = computeActiveRound(rounds);
    setActiveRoundState(computed);
  }, [rounds]);

  // 🌐 OPTIONAL: CENTRALIZED FETCH (IMPORTANT)
  const refreshRounds = async () => {
    try {
      console.log("ActiveRoundContext: Fetching /api/rounds...");
      const res = await fetch("/api/rounds");
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
  }, []);

  const setActiveRound = (round: Round | null) => {
    setActiveRoundState(round);
  };

  const value = useMemo(
    () => ({
      rounds,
      activeRound,
      setRounds,
      setActiveRound,
      refreshRounds
    }),
    [rounds, activeRound]
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