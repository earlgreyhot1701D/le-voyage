import { PackingList, PackingItem } from '@/types';

const mockPackingLists: PackingList[] = [
  {
    id: 'pl1',
    trip_id: '1',
    name: 'Paris Trip Essentials',
    created_at: '2025-01-01T00:00:00Z',
  },
];

const mockPackingItems: PackingItem[] = [
  { id: 'pi1', packing_list_id: 'pl1', name: 'Passport', category: 'documents', quantity: 1, is_packed: true, is_essential: true },
  { id: 'pi2', packing_list_id: 'pl1', name: 'Phone Charger', category: 'electronics', quantity: 1, is_packed: false, is_essential: true },
  { id: 'pi3', packing_list_id: 'pl1', name: 'Walking Shoes', category: 'clothing', quantity: 1, is_packed: false, is_essential: true },
  { id: 'pi4', packing_list_id: 'pl1', name: 'Rain Jacket', category: 'clothing', quantity: 1, is_packed: false, is_essential: false },
  { id: 'pi5', packing_list_id: 'pl1', name: 'Toiletry Bag', category: 'toiletries', quantity: 1, is_packed: false, is_essential: true },
];

export const packingService = {
  async getPackingListsForTrip(tripId: string): Promise<PackingList[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPackingLists.filter(pl => pl.trip_id === tripId);
  },

  async getPackingItems(listId: string): Promise<PackingItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPackingItems.filter(pi => pi.packing_list_id === listId);
  },

  async toggleItemPacked(itemId: string): Promise<PackingItem | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const item = mockPackingItems.find(pi => pi.id === itemId);
    if (!item) return null;
    item.is_packed = !item.is_packed;
    return item;
  },

  async addItem(listId: string, item: Omit<PackingItem, 'id' | 'packing_list_id'>): Promise<PackingItem> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newItem: PackingItem = {
      ...item,
      id: `pi-${Date.now()}`,
      packing_list_id: listId,
    };
    mockPackingItems.push(newItem);
    return newItem;
  },

  async removeItem(itemId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockPackingItems.findIndex(pi => pi.id === itemId);
    if (index === -1) return false;
    mockPackingItems.splice(index, 1);
    return true;
  },
};