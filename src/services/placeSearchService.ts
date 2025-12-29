import { supabase } from "@/integrations/supabase/client";

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  lat: number;
  lng: number;
  types: string[];
  photoUrl: string | null;
  priceLevel: number | null;
}

export interface SearchPlacesParams {
  query: string;
  location?: { lat: number; lng: number };
}

export const placeSearchService = {
  async searchPlaces({ query, location }: SearchPlacesParams): Promise<PlaceSearchResult[]> {
    console.log('[PlaceSearchService] Searching:', query);
    
    const { data, error } = await supabase.functions.invoke('search-places', {
      body: { query, location },
    });

    if (error) {
      console.error('[PlaceSearchService] Error:', error);
      throw new Error(error.message || 'Failed to search places');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.places || [];
  },

  // Map Google Places types to our categories
  mapTypesToCategory(types: string[]): string {
    const typeMap: Record<string, string> = {
      restaurant: 'Food and Drink',
      cafe: 'Food and Drink',
      bar: 'Food and Drink',
      bakery: 'Food and Drink',
      food: 'Food and Drink',
      museum: 'Museum',
      art_gallery: 'Museum',
      tourist_attraction: 'Attraction',
      point_of_interest: 'Attraction',
      park: 'Attraction',
      church: 'Attraction',
      store: 'Shopping',
      shopping_mall: 'Shopping',
      clothing_store: 'Shopping',
      train_station: 'Transit',
      transit_station: 'Transit',
      subway_station: 'Transit',
      lodging: 'Lodging',
      hotel: 'Lodging',
    };

    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }
    
    return 'Other';
  },

  // Extract neighborhood/arrondissement from address
  extractNeighborhood(address: string): { neighborhood: string | null; arrondissement: string | null } {
    // Look for Paris arrondissement pattern
    const arrMatch = address.match(/750(\d{2})/);
    const arrondissement = arrMatch ? arrMatch[1] : null;
    
    // Try to extract area name before the postal code
    const parts = address.split(',');
    const neighborhood = parts.length > 1 ? parts[parts.length - 2]?.trim() : null;
    
    return { neighborhood, arrondissement };
  }
};
