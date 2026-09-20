import { useState, useCallback, useRef } from 'react';
import { placeSearchService, PlaceSearchResult } from '@/services/placeSearchService';

export function usePlaceSearch() {
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const search = useCallback(async (query: string, location?: { lat: number; lng: number }) => {
    const currentRequest = ++requestId.current;
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const places = await placeSearchService.searchPlaces({ query, location });
      if (currentRequest === requestId.current) setResults(places);
    } catch (err) {
      console.error('Search error:', err);
      if (currentRequest === requestId.current) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      }
    } finally {
      if (currentRequest === requestId.current) setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    requestId.current++;
    setResults([]);
    setError(null);
    setIsSearching(false);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearResults,
  };
}
