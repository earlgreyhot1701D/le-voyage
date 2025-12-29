import { supabase } from '@/integrations/supabase/client';

interface Place {
  id: string;
  name: string;
  category: string;
  arrondissement?: string | null;
  neighborhood_name?: string | null;
  rating?: number | null;
}

interface GeneratedInsight {
  title: string;
  content: string;
  action_label: string | null;
  neighborhood_focus: string;
}

interface GenerateInsightsParams {
  tripId: string;
  neighborhoodFocus: string;
  places: Place[];
  tripTitle?: string;
  destination?: string;
}

export const aiService = {
  async generateInsights(params: GenerateInsightsParams): Promise<GeneratedInsight[]> {
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: {
        tripId: params.tripId,
        neighborhoodFocus: params.neighborhoodFocus,
        places: params.places.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          arrondissement: p.arrondissement,
          neighborhood_name: p.neighborhood_name,
          rating: p.rating,
        })),
        tripTitle: params.tripTitle,
        destination: params.destination,
      },
    });

    if (error) {
      console.error('AI service error:', error);
      throw new Error(error.message || 'Failed to generate insights');
    }

    return data.insights || [];
  },

  // Stub for backward compatibility
  async getInsightsForFocus(_focus: string): Promise<null> {
    return null;
  },
};
