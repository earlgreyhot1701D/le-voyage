import { RefreshCw, Sparkles } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { Button } from '@/components/ui/button';

interface Insight {
  title: string;
  content: string;
  action_label: string | null;
  neighborhood_focus: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  isLoading: boolean;
  onRefresh: () => void;
  onDismiss?: (index: number) => void;
  neighborhoodFocus?: string;
  placesCount: number;
}

export function InsightsPanel({ 
  insights, 
  isLoading, 
  onRefresh,
  onDismiss,
  neighborhoodFocus,
  placesCount
}: InsightsPanelProps) {
  const hasPlaces = placesCount > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--amber-glow))' }} />
          <h4 className="font-serif text-lg">AI Suggestions</h4>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || !hasPlaces}
          className="h-8 px-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="gem-card animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-full mb-1" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && insights.length === 0 && (
        <div className="insight-card text-center py-6">
          {!hasPlaces ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Add some places to get AI suggestions
              </p>
              <p className="text-xs text-muted-foreground opacity-70">
                I'll help you group and organize your saved spots
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                No suggestions yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="mt-2"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate suggestions
              </Button>
            </>
          )}
        </div>
      )}

      {/* Insights list */}
      {!isLoading && insights.map((insight, index) => (
        <InsightCard
          key={`${insight.title}-${index}`}
          title={insight.title}
          content={insight.content}
          actionLabel={insight.action_label}
          onDismiss={onDismiss ? () => onDismiss(index) : undefined}
        />
      ))}

      {/* Context indicator */}
      {neighborhoodFocus && insights.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center opacity-60">
          Based on your places in {neighborhoodFocus}
        </p>
      )}
    </div>
  );
}
