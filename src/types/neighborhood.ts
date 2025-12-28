export interface Neighborhood {
  id: string;
  city: string;
  name: string;
  description: string;
  vibe_tags: string[];
  walkability_score: number;
  safety_rating: number;
  hero_image_url: string | null;
}

export interface NeighborhoodHighlight {
  id: string;
  neighborhood_id: string;
  title: string;
  category: 'restaurant' | 'cafe' | 'bar' | 'shop' | 'attraction' | 'park';
  description: string | null;
}