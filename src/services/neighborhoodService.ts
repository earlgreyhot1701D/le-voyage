import { Neighborhood } from '@/types';

const mockNeighborhoods: Neighborhood[] = [
  {
    id: 'n1',
    city: 'Paris',
    name: 'Le Marais',
    description: 'Historic district known for its medieval architecture, trendy boutiques, and vibrant LGBTQ+ scene.',
    vibe_tags: ['Historic', 'Trendy', 'Artsy'],
    walkability_score: 95,
    safety_rating: 4,
    hero_image_url: null,
  },
  {
    id: 'n2',
    city: 'Paris',
    name: 'Montmartre',
    description: 'Bohemian hilltop neighborhood famous for Sacré-Cœur basilica and its artistic heritage.',
    vibe_tags: ['Artistic', 'Romantic', 'Historic'],
    walkability_score: 75,
    safety_rating: 3,
    hero_image_url: null,
  },
  {
    id: 'n3',
    city: 'Paris',
    name: 'Saint-Germain-des-Prés',
    description: 'Intellectual heart of Paris with legendary cafés, bookshops, and upscale galleries.',
    vibe_tags: ['Upscale', 'Literary', 'Classic'],
    walkability_score: 90,
    safety_rating: 5,
    hero_image_url: null,
  },
];

export const neighborhoodService = {
  async getNeighborhoods(city?: string): Promise<Neighborhood[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (city) {
      return mockNeighborhoods.filter(n => n.city.toLowerCase() === city.toLowerCase());
    }
    return mockNeighborhoods;
  },

  async getNeighborhoodById(id: string): Promise<Neighborhood | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockNeighborhoods.find(n => n.id === id) || null;
  },

  async searchNeighborhoods(query: string): Promise<Neighborhood[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const lowerQuery = query.toLowerCase();
    return mockNeighborhoods.filter(
      n =>
        n.name.toLowerCase().includes(lowerQuery) ||
        n.city.toLowerCase().includes(lowerQuery) ||
        n.vibe_tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },
};