import { useState, useEffect, useRef } from 'react';

export const usePollingGovernor = <T>(
    fetchFn: () => Promise<T>,
    interval: number = 5000,
    maxRetries: number = 3
) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const retryCount = useRef(0);
    const timerRef = useRef<NodeJS.Timeout>();

    const poll = async () => {
        try {
            const result = await fetchFn();
            setData(result);
            setError(null);
            retryCount.current = 0;
        } catch (e: any) {
            retryCount.current += 1;
            if (retryCount.current >= maxRetries) {
                setError(e.message || "Polling failed");
            }
        } finally {
            timerRef.current = setTimeout(poll, interval * Math.pow(1.5, retryCount.current));
        }
    };

    useEffect(() => {
        poll();
        return () => clearTimeout(timerRef.current);
    }, []);

    return { data, error };
};
