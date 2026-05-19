import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useZRLReality } from '../../services/ZRLRealityProvider';

interface SeasonInitContextType {
    selectedSeasonId: number | null;
    activeRound: number;
    isProcessing: boolean;
    seasons: any[];
    activeSeason: any | null;
    setSelectedSeasonId: (id: number) => void;
    setActiveRound: (round: number) => void;
    executeAction: (type: string, payload: any, label: string) => Promise<void>;
}

const SeasonInitContext = createContext<SeasonInitContextType | undefined>(undefined);

export function SeasonInitProvider({ children }: { children: ReactNode }) {
    const { seasons: seasonsQueryResult, mutate } = useZRLReality();
    const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
    const [activeRound, setActiveRound] = useState<number>(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const seasons = seasonsQueryResult?.data?.data || [];
    const activeSeason = seasons.find((s: any) => s.id === selectedSeasonId) || null;

    useEffect(() => {
        if (seasons.length > 0 && !selectedSeasonId) {
            const active = seasons.find((s: any) => s.is_active);
            if (active) setSelectedSeasonId(active.id);
            else setSelectedSeasonId(seasons[0].id);
        }
    }, [seasons, selectedSeasonId]);

    const executeAction = async (type: string, payload: any, label: string) => {
        setIsProcessing(true);
        try {
            await mutate(type, { ...payload, seasonId: selectedSeasonId, roundIndex: activeRound });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SeasonInitContext.Provider value={{
            selectedSeasonId,
            activeRound,
            isProcessing,
            seasons,
            activeSeason,
            setSelectedSeasonId,
            setActiveRound,
            executeAction
        }}>
            {children}
        </SeasonInitContext.Provider>
    );
}

export function useSeasonInit() {
    const context = useContext(SeasonInitContext);
    if (context === undefined) {
        throw new Error('useSeasonInit must be used within a SeasonInitProvider');
    }
    return context;
}
