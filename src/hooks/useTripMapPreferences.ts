import { useCallback, useEffect, useState } from 'react';

type MapMode = 'selected' | 'all';
interface MapPreferences {
  tripId: string;
  mode: MapMode;
  selectedIds: string[];
}

const storageKey = (tripId: string) => `le-voyage:trip-map:v1:${tripId}`;

function readPreferences(tripId: string): MapPreferences {
  const defaults: MapPreferences = { tripId, mode: 'selected', selectedIds: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(tripId)) || 'null');
    if (!saved || !Array.isArray(saved.selectedIds)) return defaults;
    return {
      tripId,
      mode: saved.mode === 'all' ? 'all' : 'selected',
      selectedIds: [...new Set<string>(saved.selectedIds.filter((id: unknown) => typeof id === 'string'))],
    };
  } catch {
    return defaults;
  }
}

export function useTripMapPreferences(tripId: string) {
  const [preferences, setPreferences] = useState(() => readPreferences(tripId));
  const ready = preferences.tripId === tripId;

  useEffect(() => {
    if (!ready) setPreferences(readPreferences(tripId));
  }, [tripId, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey(tripId), JSON.stringify({
        mode: preferences.mode,
        selectedIds: preferences.selectedIds,
      }));
    } catch {
      // Map controls still work when browser storage is unavailable or full.
    }
  }, [tripId, ready, preferences]);

  const setMapMode = useCallback((mode: MapMode) => setPreferences(previous => ({
    ...(previous.tripId === tripId ? previous : readPreferences(tripId)), mode,
  })), [tripId]);
  const setSelectedMapIds = useCallback((value: string[] | ((ids: string[]) => string[])) => {
    setPreferences(previous => {
      const current = previous.tripId === tripId ? previous : readPreferences(tripId);
      const selectedIds = typeof value === 'function' ? value(current.selectedIds) : value;
      return selectedIds === current.selectedIds ? current : { ...current, selectedIds };
    });
  }, [tripId]);

  return {
    mapMode: ready ? preferences.mode : 'selected' as MapMode,
    selectedMapIds: ready ? preferences.selectedIds : [],
    setMapMode,
    setSelectedMapIds,
    ready,
  };
}
