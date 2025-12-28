export type PlaceCategory =
  | 'Food and Drink'
  | 'Museum'
  | 'Attraction'
  | 'Shopping'
  | 'Experience'
  | 'Transit'
  | 'Lodging'
  | 'Day Trip'
  | 'Other';

export interface Place {
  id: string;
  name: string;
  arrondissement: string | null;
  neighborhood_name: string | null;
  category: PlaceCategory;
  rating: number | null;
  badge: string | null;
  area_id: string | null;
}
