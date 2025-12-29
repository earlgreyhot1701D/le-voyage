import { PlaceSearchResult } from '@/services/placeSearchService';

interface PlaceSearchResultsProps {
  results: PlaceSearchResult[];
  isLoading: boolean;
  onSelect: (place: PlaceSearchResult) => void;
  onClose: () => void;
}

export function PlaceSearchResults({ results, isLoading, onSelect, onClose }: PlaceSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="animate-spin">⏳</span>
          Searching Google Places...
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-lg max-h-[400px] overflow-y-auto">
      <div className="p-2">
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
          <span>{results.length} results from Google Places</span>
          <button onClick={onClose} className="hover:text-foreground">✕</button>
        </div>
        
        {results.map((place) => (
          <button
            key={place.id}
            onClick={() => onSelect(place)}
            className="w-full text-left px-3 py-3 hover:bg-muted/50 rounded-lg transition-colors group"
          >
            <div className="flex items-start gap-3">
              {/* Photo thumbnail */}
              {place.photoUrl ? (
                <img 
                  src={place.photoUrl} 
                  alt={place.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-lg">
                  📍
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-medium text-foreground group-hover:text-primary truncate">
                  {place.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {place.address}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {place.rating && (
                    <span className="text-xs" style={{ color: 'hsl(var(--amber-glass))' }}>
                      ★ {place.rating}
                    </span>
                  )}
                  {place.priceLevel && (
                    <span className="text-xs text-muted-foreground">
                      {'$'.repeat(place.priceLevel)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Add button */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: 'hsl(var(--amber-glass))', 
                    color: 'hsl(var(--metro-green))' 
                  }}
                >
                  + Add
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlaceSearchResults;
