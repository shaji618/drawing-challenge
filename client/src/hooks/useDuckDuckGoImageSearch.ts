import React from 'react';

export interface ImageResult {
    image: string;
    thumbnail?: string;
    title?: string;
}

interface UseDuckDuckGoImageSearchResult {
    ddgImages: ImageResult[];
    ddgLoading: boolean;
    ddgError: string | null;
}

const imageCache = new Map<string, ImageResult[]>();

export const useDuckDuckGoImageSearch = (
    query: string,
    category?: string
): UseDuckDuckGoImageSearchResult => {
    const [ddgImages, setDdgImages] = React.useState<ImageResult[]>([]);
    const [ddgLoading, setDdgLoading] = React.useState(false);
    const [ddgError, setDdgError] = React.useState<string | null>(null);
    const abortRef = React.useRef<AbortController | null>(null);

    React.useEffect((): (() => void) => {
        if (!query) {
            setDdgImages([]);
            setDdgError(null);
            setDdgLoading(false);
            return () => { /* empty */ };
        }

        const cached = imageCache.get(query);
        if (cached) {
            setDdgImages(cached);
            setDdgLoading(false);
            setDdgError(null);
            return () => { /* empty */ };
        }

        const controller = new AbortController();
        abortRef.current?.abort();
        abortRef.current = controller;

        let mounted = true;

        const fetchImages = async (): Promise<void> => {
            try {
                setDdgLoading(true);
                setDdgError(null);

                const buildQueryParams = (query: string, category?: string): string => {
                    const params = new URLSearchParams({ query });
                    if (category) params.append('category', category);
                    return params.toString();
                };

                const res = await fetch(
                    `http://localhost:3001/api/ddgImages?${buildQueryParams(query, category)}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error('Failed to fetch images');

                const data: ImageResult[] = await res.json();
                imageCache.set(query, data);

                if (mounted) setDdgImages(data);
            } catch (err: unknown) {
                if ((err as Error).name !== 'AbortError' && mounted) {
                    setDdgError('Unable to load images');
                    setDdgImages([]);
                }
            } finally {
                if (mounted) setDdgLoading(false);
            }
        };

        void fetchImages();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [query]);

    return { ddgImages, ddgLoading, ddgError };
};