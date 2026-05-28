import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode
} from 'react';
import { useZRLReality } from '../../services/ZRLRealityProvider';

interface RoundControlContextType {
  selectedRoundId: number | null;
  selectedWtrlId: number | null;
  selectedSeasonCode: string | null;
  isProcessing: boolean;
  rounds: any[];
  seasons: any[];
  activeRound: any | null;
  activeRaces: any[];
  setSelectedRoundId: (id: number | null) => void;
  setSelectedWtrlId: (id: number | null) => void;
  setSelectedSeasonCode: (code: string | null) => void;
  executeAction: (type: string, payload: any, label: string) => Promise<void>;
  bootstrapRounds: (payload: { rawText: string, baseYear: number, season_code?: string }) => Promise<any>;
}

const RoundControlContext = createContext<RoundControlContextType | undefined>(undefined);

export function RoundControlProvider({ children }: { children: ReactNode }) {
  const { rounds: roundsQuery, seasons: seasonsQuery, mutate } = useZRLReality();

  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(() => {
    const saved = localStorage.getItem('last_selected_round_id');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const [selectedWtrlId, setSelectedWtrlId] = useState<number | null>(() => {
    const saved = localStorage.getItem('last_selected_wtrl_id');
    return saved ? parseInt(saved, 10) : null;
  });

  const [selectedSeasonCode, setSelectedSeasonCode] = useState<string | null>(() => {
      return localStorage.getItem('last_selected_season_code');
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRaces, setActiveRaces] = useState<any[]>([]);

  // Persist state changes
  useEffect(() => {
      if (selectedRoundId) localStorage.setItem('last_selected_round_id', selectedRoundId.toString());
      else localStorage.removeItem('last_selected_round_id');
  }, [selectedRoundId]);

  useEffect(() => {
      if (selectedWtrlId) localStorage.setItem('last_selected_wtrl_id', selectedWtrlId.toString());
      else localStorage.removeItem('last_selected_wtrl_id');
  }, [selectedWtrlId]);

  useEffect(() => {
      if (selectedSeasonCode) localStorage.setItem('last_selected_season_code', selectedSeasonCode);
      else localStorage.removeItem('last_selected_season_code');
  }, [selectedSeasonCode]);

  const rounds = useMemo(() => {
    let raw = roundsQuery?.data || [];
    if (selectedSeasonCode) {
        return raw.filter((r: any) => r.season_code === selectedSeasonCode);
    }
    return raw;
  }, [roundsQuery?.data, selectedSeasonCode]);

  const seasons = useMemo(() => {
    return seasonsQuery?.data || [];
  }, [seasonsQuery?.data]);

  const activeRound = useMemo(() => {
    if (!rounds.length) return null;
    if (selectedWtrlId) {
        return rounds.find((r: any) => r.wtrl_id === selectedWtrlId) || null;
    }
    return (
      rounds.find((r: any) => r.id === selectedRoundId) ||
      rounds.find((r: any) => r.sync_state === 'SYNCING') ||
      rounds[0] ||
      null
    );
  }, [rounds, selectedRoundId, selectedWtrlId]);

  // -----------------------------
  // RACES AUTO-LOADER (CORRETTO)
  // -----------------------------
  useEffect(() => {
    async function loadRaces() {
        if (!selectedRoundId) {
            setActiveRaces([]);
            return;
        }
        try {
            // Aggiornato per usare round_v2_id come richiesto dal nuovo endpoint
            const res = await fetch(`/api/admin/get-races?round_v2_id=${selectedRoundId}`);
            if (res.ok) {
                const data = await res.json();
                setActiveRaces(data);
            }
        } catch (e) {
            console.error("Error loading races", e);
        }
    }
    loadRaces();
  }, [selectedWtrlId, roundsQuery.data]);

  useEffect(() => {
    const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    if (rounds.length && !selectedRoundId && !selectedWtrlId) {
        if (isLocal) {
            const round4 = rounds.find((r: any) => r.id === 4);
            if (round4) {
                setSelectedRoundId(round4.id);
                setSelectedWtrlId(round4.wtrl_id);
                return;
            }
        }
        const active = rounds.find((r: any) => r.sync_state === 'ACTIVE') || rounds[0];
        if (active) {
            setSelectedRoundId(active.id);
            setSelectedWtrlId(active.wtrl_id);
        }
    }
  }, [rounds, selectedRoundId, selectedWtrlId]);

  const executeAction = async (type: string, payload: any, label: string) => {
    try {
      setIsProcessing(true);
      await mutate(type, {
        ...payload,
        roundId: selectedRoundId,
        wtrlId: selectedWtrlId,
        seasonCode: selectedSeasonCode
      });
    } catch (err) {
      console.error(`[RoundControl] Action failed: ${label}`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  const bootstrapRounds = async (payload: { rawText: string, baseYear: number, season_code?: string }) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/rounds/bootstrap-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[RoundControl] Bootstrap failed", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const value: RoundControlContextType = {
    selectedRoundId,
    selectedWtrlId,
    selectedSeasonCode,
    isProcessing,
    rounds,
    seasons,
    activeRound,
    activeRaces,
    setSelectedRoundId,
    setSelectedWtrlId,
    setSelectedSeasonCode,
    executeAction,
    bootstrapRounds
  };

  return (
    <RoundControlContext.Provider value={value}>
      {children}
    </RoundControlContext.Provider>
  );
}

export function useRoundControl() {
  const context = useContext(RoundControlContext);
  if (!context) {
    throw new Error('useRoundControl must be used within RoundControlProvider');
  }
  return context;
}
