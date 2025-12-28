// Map Service Stub - Phase 0
// This will connect to Mapbox in Phase 2

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
  async geocodeAddress(_address: string): Promise<MapCoordinates | null> {
    // Stub: Returns null in Phase 0
    console.log('[Map Service] geocodeAddress called - stubbed in Phase 0');
    return null;
  },

  async reverseGeocode(_coords: MapCoordinates): Promise<string | null> {
    // Stub: Returns null in Phase 0
    console.log('[Map Service] reverseGeocode called - stubbed in Phase 0');
    return null;
  },

  getStaticMapUrl(_coords: MapCoordinates, _zoom: number = 14): string {
    // Stub: Returns placeholder in Phase 0
    console.log('[Map Service] getStaticMapUrl called - stubbed in Phase 0');
    return '';
  },
};