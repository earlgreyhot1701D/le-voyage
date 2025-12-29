import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Place = Tables<'places'>;

interface GeneratedInsight {
  title: string;
  content: string;
  action_label: string | null;
  neighborhood_focus: string;
}

interface UseAIInsightsParams {
  tripId: string;
  tripTitle?: string;
  destination?: string;
}

export function useAIInsights({ tripId, tripTitle, destination }: UseAIInsightsParams) {
  const [insights, setInsights] = useState<GeneratedInsight[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ 
      neighborhoodFocus, 
      places 
    }: { 
      neighborhoodFocus: string; 
      places: Place[];
    }) => {
      return aiService.generateInsights({
        tripId,
        neighborhoodFocus,
        places,
        tripTitle,
        destination,
      });
    },
    onSuccess: (data, variables) => {
      setInsights(data);
      setLastGenerated(variables.neighborhoodFocus);
    },
    onError: (error: Error) => {
      console.error('Failed to generate insights:', error);
      toast.error('Could not generate suggestions. Please try again.');
    },
  });

  const generateInsights = useCallback(
    (neighborhoodFocus: string, places: Place[]) => {
      // Throttle: don't regenerate for the same neighborhood within 30 seconds
      if (lastGenerated === neighborhoodFocus && mutation.isPending) {
        return;
      }
      
      mutation.mutate({ neighborhoodFocus, places });
    },
    [mutation, lastGenerated]
  );

  const clearInsights = useCallback(() => {
    setInsights([]);
    setLastGenerated(null);
  }, []);

  return {
    insights,
    isLoading: mutation.isPending,
    error: mutation.error,
    generateInsights,
    clearInsights,
  };
}
