export interface PackingList {
  id: string;
  trip_id: string;
  name: string;
  created_at: string;
}

export interface PackingItem {
  id: string;
  packing_list_id: string;
  name: string;
  category: 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'misc';
  quantity: number;
  is_packed: boolean;
  is_essential: boolean;
}