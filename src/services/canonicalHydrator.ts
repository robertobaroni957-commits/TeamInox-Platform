import { useState, useEffect } from 'react';

/**
 * Canonical Season Hydration Engine
 * Fetches and flattens season/round data.
 */
export async function getCanonicalSeasonState() {
    try {
        // Fetch seasons and rounds in parallel
        const [seasonsRes, roundsRes] = await Promise.all([
            fetch('/api/data/seasons').then(r => r.json()),
            fetch('/api/data/rounds').then(r => r.json())
        ]);

        const seasons = seasonsRes.data || [];
        const rounds = roundsRes.data || [];

        // 1. Identify active season (is_active flag or default to first/latest)
        const activeSeason = seasons.find((s: any) => s.is_active) || seasons[0];
        if (!activeSeason) return { season: null, rounds: [], activeRound: null };

        // 2. Identify active round (Backend-driven)
        const activeRound = rounds.find((r: any) => r.status === 'ACTIVE') || 
                            rounds.find((r: any) => r.is_active) || 
                            rounds[0] || null;

        return {
            season: activeSeason,
            rounds: rounds.filter((r: any) => r.season_id === activeSeason.id),
            activeRound: activeRound
        };
    } catch (e) {
        console.error("[CANONICAL HYDRATION] Failed", e);
        return { season: null, rounds: [], activeRound: null };
    }
}
