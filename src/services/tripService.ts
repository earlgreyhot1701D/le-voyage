import { Trip, TripDay, TripActivity } from '@/types';

// Mock data for Phase 0
const mockTrips: Trip[] = [
  {
    id: '1',
    user_id: 'mock-user-1',
    title: 'Paris Adventure',
    destination: 'Paris, France',
    start_date: '2025-03-15',
    end_date: '2025-03-22',
    status: 'planning',
    cover_image_url: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'mock-user-1',
    title: 'Tokyo Discovery',
    destination: 'Tokyo, Japan',
    start_date: '2025-05-10',
    end_date: '2025-05-20',
    status: 'upcoming',
    cover_image_url: null,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
];

const mockTripDays: TripDay[] = [
  { id: 'd1', trip_id: '1', date: '2025-03-15', day_number: 1, title: 'Arrival & Montmartre' },
  { id: 'd2', trip_id: '1', date: '2025-03-16', day_number: 2, title: 'Louvre & Marais' },
  { id: 'd3', trip_id: '1', date: '2025-03-17', day_number: 3, title: 'Versailles Day Trip' },
];

const mockActivities: TripActivity[] = [
  {
    id: 'a1',
    trip_day_id: 'd1',
    title: 'Check into Hotel',
    description: 'Arrive at Hotel Le Marais',
    start_time: '14:00',
    end_time: '15:00',
    location: 'Le Marais, Paris',
    category: 'accommodation',
    order_index: 0,
    notes: null,
  },
  {
    id: 'a2',
    trip_day_id: 'd1',
    title: 'Explore Montmartre',
    description: 'Walk through the artistic neighborhood',
    start_time: '16:00',
    end_time: '19:00',
    location: 'Montmartre, Paris',
    category: 'activity',
    order_index: 1,
    notes: 'Visit Sacré-Cœur',
  },
];

// Service stubs - will connect to Supabase in Phase 1
export const tripService = {
  async getTrips(): Promise<Trip[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTrips;
  },

  async getTripById(id: string): Promise<Trip | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTrips.find(t => t.id === id) || null;
  },

  async getTripDays(tripId: string): Promise<TripDay[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTripDays.filter(d => d.trip_id === tripId);
  },

  async getTripActivities(tripDayId: string): Promise<TripActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockActivities.filter(a => a.trip_day_id === tripDayId);
  },

  async createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTrips.push(newTrip);
    return newTrip;
  },

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockTrips.findIndex(t => t.id === id);
    if (index === -1) return null;
    mockTrips[index] = { ...mockTrips[index], ...updates, updated_at: new Date().toISOString() };
    return mockTrips[index];
  },

  async deleteTrip(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockTrips.findIndex(t => t.id === id);
    if (index === -1) return false;
    mockTrips.splice(index, 1);
    return true;
  },
};