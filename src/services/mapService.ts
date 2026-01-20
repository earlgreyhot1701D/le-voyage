// Map Service - Geocoding and map utilities

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapMarker {
  id: string;
  coordinates: MapCoordinates;
  title: string;
  type: 'activity' | 'hotel' | 'restaurant' | 'attraction';
}

export const mapService = {
  /**
   * Geocode an address string to coordinates using Mapbox Geocoding API.
   * Results are cached in localStorage to avoid repeated API calls.
   */
  async geocodeAddress(address: string, mapboxToken: string): Promise<MapCoordinates | null> {
    if (!address || !mapboxToken) return null;

    // Check localStorage cache first
    const cacheKey = `geocode:${address.toLowerCase().trim()}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Invalid cache entry, continue to fetch
      }
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`
      );
      
      if (!response.ok) {
        console.error('[Map Service] Geocoding request failed:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const coords: MapCoordinates = { latitude: lat, longitude: lng };
        
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        console.log(`[Map Service] Geocoded "${address}" to:`, coords);
        return coords;
      }
      
      console.log(`[Map Service] No results for "${address}"`);
      return null;
    } catch (error) {
      console.error('[Map Service] Geocoding error:', error);
      return null;
    }
  },

  async reverseGeocode(_coords: MapCoordinates): Promise<string | null> {
    // Stub: Not needed for current implementation
    console.log('[Map Service] reverseGeocode called - not implemented');
    return null;
  },

  getStaticMapUrl(_coords: MapCoordinates, _zoom: number = 14): string {
    // Stub: Not needed for current implementation
    console.log('[Map Service] getStaticMapUrl called - not implemented');
    return '';
  },
};