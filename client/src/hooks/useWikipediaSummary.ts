import { useEffect, useState } from 'react';

interface UseWikipediaSummaryResult {
    wikipediaSummary: string | null;
    wikipediaLoading: boolean;
    wikipediaError: string | null;
}

const summaryCache = new Map<string, string>();

export const useWikipediaSummary = (
    title: string,
    category?: string
): UseWikipediaSummaryResult => {
    const [wikipediaSummary, setWikipediaSummary] = useState<string | null>(null);
    const [wikipediaLoading, setWikipediaLoading] = useState(false);
    const [wikipediaError, setWikipediaError] = useState<string | null>(null);

    useEffect((): (() => void) => {
        if (!title) {
            setWikipediaSummary(null);
            setWikipediaError(null);
            setWikipediaLoading(false);
            return () => { /* empty */ };
        }

        const cached = summaryCache.get(title);

        if (cached) {
            setWikipediaSummary(cached);
            setWikipediaError(null);
            setWikipediaLoading(false);
            return () => { /* empty */ };
        }

        const controller = new AbortController();
        let mounted = true;

        const fetchSummary = async (): Promise<void> => {
            try {
                setWikipediaLoading(true);
                setWikipediaError(null);

                const buildQueryParams = (title: string, category?: string): string => {
                    const params = new URLSearchParams({ title });
                    if (category) params.append('category', category);
                    return params.toString();
                };

                const response = await fetch(
                    `http://localhost:3001/api/wikiSummary?${buildQueryParams(title, category)}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch summary');
                }

                const data: { summary: string } = await response.json();

                summaryCache.set(title, data.summary);

                if (mounted) {
                    setWikipediaSummary(data.summary);
                }
            } catch (err: unknown) {
                if (
                    err instanceof Error &&
                    err.name !== 'AbortError' &&
                    mounted
                ) {
                    setWikipediaError('Failed to load summary');
                    setWikipediaSummary(null);
                }
            } finally {
                if (mounted) {
                    setWikipediaLoading(false);
                }
            }
        };

        void fetchSummary();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [title]);

    return { wikipediaSummary, wikipediaLoading, wikipediaError };
};