import { useState, forwardRef, useCallback, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useSearchParams, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { TopBar } from '@/components/layout/TopBar';
import { RightPanel } from '@/components/layout/RightPanel';
import { useTrip, useTripDays, useItineraryItems, useInsights } from '@/hooks/useTrips';
import { usePlaces, useCreatePlace, useDeletePlace, useUpdatePlace } from '@/hooks/usePlaces';
import { useTripPermissions } from '@/hooks/useTripPermissions';
import { useAIInsights } from '@/hooks/useAIInsights';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { useGenerateTripDays } from '@/hooks/useItinerary';
import { EditTripModal, CollaboratorsModal } from '@/components/trips';
import { InsightsPanel } from '@/components/insights';
import { PlaceSearchResults } from '@/components/places';
import { TripMap } from '@/components/map';
import { AddToItineraryModal } from '@/components/itinerary';
import { placeSearchService } from '@/services/placeSearchService';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type TripDay = Tables<'trip_days'>;
type Place = Tables<'places'> & { added_by_display_name?: string | null };
type ItineraryItem = Tables<'itinerary_items'> & { profiles?: { display_name: string | null } | null };
type Insight = Tables<'insights'>;

// ============= ITINERARY VIEW COMPONENTS =============

function DaySelector({ 
  days, 
  selectedDayId, 
  onSelectDay 
}: { 
  days: TripDay[]; 
  selectedDayId: string; 
  onSelectDay: (id: string) => void;
}) {
  const formatDayLabel = (day: TripDay) => {
    const date = new Date(day.date);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  return (
    <div className="flex gap-5 mb-8 border-b border-border pb-4">
      {days.map((day) => (
        <button
          key={day.id}
          onClick={() => onSelectDay(day.id)}
          className={`day-pill ${day.id === selectedDayId ? 'active' : ''}`}
        >
          {formatDayLabel(day)}
        </button>
      ))}
    </div>
  );
}

function EventRow({ 
  item, 
  place,
  isLast 
}: { 
  item: ItineraryItem; 
  place?: Place;
  isLast: boolean;
}) {
  const displayName = item.profiles?.display_name;
  
  return (
    <div className="event-row">
      <div className="event-time">{item.time}</div>
      <div className={`event-details ${isLast ? 'border-none' : ''}`}>
        <h4>{item.title}</h4>
        <p className="text-[13px] text-muted-foreground">{item.description}</p>
        
        {/* Place rating and badge */}
        {place && (place.rating || place.badge) && (
          <span 
            className="inline-block mt-2.5 text-[11px]"
            style={{ color: 'hsl(var(--iron-rust))' }}
          >
            {place.rating && `★ ${place.rating}/5`}
            {place.rating && place.badge && ' • '}
            {place.badge}
          </span>
        )}
        
        {/* Attribution */}
        {displayName && (
          <p className="text-[11px] text-muted-foreground mt-2 opacity-70">
            Added by {displayName}
          </p>
        )}
      </div>
    </div>
  );
}

function IntelligencePanel({ 
  neighborhoodFocus,
  insights,
  places,
  destination
}: { 
  neighborhoodFocus: string;
  insights: Insight[];
  places: Place[];
  destination?: string;
}) {
  const insight = insights.find(i => i.neighborhood_focus === neighborhoodFocus);
  
  return (
    <aside className="flex flex-col gap-5">
      {/* Interactive Map */}
      <TripMap 
        places={places}
        destination={destination}
        className="h-[250px]"
      />

      {/* Gem Card - AI Insight */}
      {insight && (
        <div className="gem-card">
          <h5 className="font-serif text-xl mb-2.5" style={{ color: 'hsl(var(--amber-glow))' }}>
            {insight.title}
          </h5>
          <p className="text-[13px] leading-relaxed opacity-90">
            {insight.content}
          </p>
          {insight.action_label && (
            <button className="btn-nouveau">{insight.action_label}</button>
          )}
        </div>
      )}

      {/* Budget Insight - Coming Soon */}
      <div className="insight-card relative">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
            Coming Soon
          </span>
        </div>
        <h5 className="font-serif text-xl mb-4">Budget Insight</h5>
        <div 
          className="h-2.5 rounded mb-2.5 overflow-hidden"
          style={{ background: 'hsl(var(--muted))' }}
        >
          <div 
            className="h-full"
            style={{ width: '65%', background: 'hsl(var(--seine-blue))' }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          You have utilized <b>65%</b> of your Parisian dining budget.
        </p>
      </div>
    </aside>
  );
}

function ItineraryView({ tripId, destination }: { tripId: string; destination?: string }) {
  const { data: tripDays = [], isLoading: daysLoading } = useTripDays(tripId);
  const { data: places = [] } = usePlaces(tripId);
  const { data: insights = [] } = useInsights(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const generateDays = useGenerateTripDays(tripId);
  
  // Select first day when days load
  const effectiveDayId = selectedDayId || tripDays[0]?.id;
  
  const { data: items = [], isLoading: itemsLoading } = useItineraryItems(effectiveDayId);
  
  const selectedDay = tripDays.find(d => d.id === effectiveDayId);

  // Auto-generate days if none exist (after trip has dates)
  useEffect(() => {
    if (!daysLoading && tripDays.length === 0) {
      generateDays.mutate();
    }
  }, [daysLoading, tripDays.length]);

  if (daysLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading itinerary...
      </div>
    );
  }

  if (tripDays.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-2">No days planned yet.</p>
          <p className="text-sm">Add trip dates to start planning your itinerary.</p>
          <button 
            onClick={() => generateDays.mutate()}
            disabled={generateDays.isPending}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {generateDays.isPending ? 'Generating...' : 'Generate Days'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="grid flex-1 px-10 pb-10 overflow-y-auto scrollbar-thin"
      style={{ 
        gridTemplateColumns: '1fr 350px',
        gap: '30px'
      }}
    >
      {/* Itinerary Card */}
      <section className="content-card">
        <DaySelector 
          days={tripDays} 
          selectedDayId={effectiveDayId || ''}
          onSelectDay={setSelectedDayId}
        />
        
        <h3 className="font-serif text-[32px] mb-8">
          {selectedDay?.title || `Day ${selectedDay?.day_number}`}
        </h3>
        
        {itemsLoading && (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        )}
        
        {!itemsLoading && items.map((item, index) => {
          const place = places.find(p => p.id === item.place_id);
          return (
            <EventRow 
              key={item.id} 
              item={item}
              place={place}
              isLast={index === items.length - 1}
            />
          );
        })}
        
        {!itemsLoading && items.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No activities planned for this day yet.
          </p>
        )}
      </section>

      {/* Intelligence Panel */}
      <IntelligencePanel 
        neighborhoodFocus={selectedDay?.neighborhood_focus || ''} 
        insights={insights}
        places={places}
        destination={destination}
      />
    </div>
  );
}

// ============= NEIGHBORHOODS VIEW COMPONENTS =============

function groupPlacesByArea(places: Place[]) {
  const groups: Record<string, Place[]> = {};
  
  places.forEach(place => {
    const key = place.arrondissement 
      ? `${place.arrondissement} Arrondissement`
      : place.neighborhood_name || 'Other';
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(place);
  });
  
  return groups;
}

interface PlaceCardProps {
  place: Place;
  onRemove?: () => void;
  onAddToItinerary?: () => void;
  onUpdateNotes?: (notes: string) => Promise<void>;
  canEdit?: boolean;
}

const PlaceCard = forwardRef<HTMLDivElement, PlaceCardProps>(({ place, onRemove, onAddToItinerary, onUpdateNotes, canEdit }, ref) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(place.notes || '');

  // Generate Google Search URL for researching the place
  const getSearchUrl = () => {
    const searchQuery = `${place.name} ${place.address || place.neighborhood_name || ''}`;
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleSaveNotes = async () => {
    try {
      await onUpdateNotes?.(notesValue.trim());
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Failed to save place notes:', error);
      toast.error('Could not save your note. Please try again.');
    }
  };

  const handleCancelNotes = () => {
    setNotesValue(place.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <div ref={ref} className="content-card hover:shadow-md transition-shadow group relative">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onAddToItinerary && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToItinerary();
            }}
            className="w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center text-xs font-medium"
            title="Add to itinerary"
          >
            +
          </button>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-7 h-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center text-xs font-medium"
            title="Remove place"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const url = getSearchUrl();
                const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                if (!newWindow) {
                  toast.info('Popup blocked. Right-click and "Open in new tab" or allow popups.');
                }
              }}
              className="font-serif text-xl font-semibold text-card-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group/link text-left"
              title="Search for more info"
            >
              {place.name}
              <svg 
                className="w-4 h-4 opacity-70 group-hover/link:opacity-100 transition-opacity text-muted-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = place.latitude != null && place.longitude != null
                  ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address || `${place.name} ${place.neighborhood_name || ''}`)}`;
                const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                if (!newWindow) {
                  toast.info('Popup blocked. Allow popups to open Google Maps.');
                }
              }}
              className="w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
              title="Get directions in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{place.address || place.neighborhood_name}</p>
        </div>
        {place.rating && (
          <div className="text-right">
            <p className="text-2xl font-semibold text-primary">{String(place.rating)}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
          {place.category}
        </span>
        {place.badge && (
          <span 
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{ 
              background: 'hsl(var(--amber-glass) / 0.2)', 
              color: 'hsl(var(--amber-glow))' 
            }}
          >
            {place.badge}
          </span>
        )}
      </div>
      
      {/* Personal Notes Section */}
      {isEditingNotes ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add a personal note (e.g., why you want to visit, recommendations...)"
            className="w-full p-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveNotes();
              }
              if (e.key === 'Escape') {
                handleCancelNotes();
              }
            }}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancelNotes}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : place.notes ? (
        <div className="mt-3 group/notes">
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            "{place.notes}"
            {canEdit && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="ml-2 opacity-0 group-hover/notes:opacity-100 text-xs text-primary hover:text-primary/80 transition-all"
              >
                Edit
              </button>
            )}
          </p>
        </div>
      ) : canEdit ? (
        <button
          onClick={() => setIsEditingNotes(true)}
          className="mt-3 text-xs text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
        >
          + Add a note
        </button>
      ) : null}
      
      {/* Attribution */}
      {place.added_by_display_name && (
        <p className="text-[11px] text-muted-foreground mt-3 opacity-70">
          Added by {place.added_by_display_name}
        </p>
      )}
    </div>
  );
});
PlaceCard.displayName = 'PlaceCard';

const CATEGORIES = ['Food and Drink', 'Museum', 'Attraction', 'Experience', 'Shopping', 'Lodging', 'Transit', 'Day Trip', 'Other'] as const;

interface ExplorerFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
  arrondissements: string[];
  selectedArrondissement: string;
  onArrondissementChange: (arr: string) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  showMap: boolean;
  onToggleMap: () => void;
}

const ExplorerFilters = forwardRef<HTMLDivElement, ExplorerFiltersProps>(
  ({ 
    selectedCategories, 
    onCategoryChange, 
    onClearFilters, 
    arrondissements,
    selectedArrondissement,
    onArrondissementChange,
    minRating,
    onMinRatingChange,
    showMap,
    onToggleMap
  }, ref) => {
    const hasActiveFilters = selectedCategories.length > 0 || selectedArrondissement !== 'All' || minRating > 0;
    
    return (
      <div ref={ref}>
        <RightPanel title="Filters">
          <div className="space-y-6">
            {/* Map Toggle */}
            <div>
              <button
                onClick={onToggleMap}
                className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                  showMap 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background text-foreground border-border hover:border-primary/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Arrondissement</label>
              <select 
                value={selectedArrondissement}
                onChange={(e) => onArrondissementChange(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="All">All</option>
                {arrondissements.map(arr => (
                  <option key={arr} value={arr}>{arr}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Category</label>
                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => onCategoryChange(cat)}
                      className="rounded border-border accent-primary" 
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Rating: {minRating === 0 ? 'Any' : `${minRating}+`}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => onMinRatingChange(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Any</span>
                <span>5 Stars</span>
              </div>
            </div>
          </div>
        </RightPanel>
      </div>
    );
  }
);
ExplorerFilters.displayName = 'ExplorerFilters';

interface ManualAddFormProps {
  tripId: string;
  neighborhoods: string[];
  onClose: () => void;
}

function ManualAddForm({ tripId, neighborhoods, onClose }: ManualAddFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const createPlace = useCreatePlace();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      await createPlace.mutateAsync({
        trip_id: tripId,
        name: name.trim(),
        address: address.trim() || null,
        arrondissement: null,
        neighborhood_name: neighborhood || null,
        category: 'Other',
        rating: null,
        badge: null,
        area_id: null,
        latitude: null,
        longitude: null,
      });
      
      toast.success(`Added "${name.trim()}" to your trip!`);
      setName('');
      setAddress('');
      setNeighborhood('');
      onClose();
    } catch (error) {
      console.error('Failed to add place:', error);
      toast.error('Failed to add place');
    }
  };

  return (
    <div className="mt-3 p-4 border border-border rounded-xl bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Add Manually</h4>
        <button 
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Place name (e.g., Café de Flore)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full p-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>
        <div>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="p-2 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="">Neighborhood</option>
            {neighborhoods.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || createPlace.isPending}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {createPlace.isPending ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
}

interface NeighborhoodsViewProps {
  tripId: string;
  tripTitle?: string;
  destination?: string;
}

function NeighborhoodsView({ tripId, tripTitle, destination }: NeighborhoodsViewProps) {
  const { data: places = [], isLoading } = usePlaces(tripId);
  const { data: tripDays = [] } = useTripDays(tripId);
  const deletePlace = useDeletePlace(tripId);
  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  const { canEdit } = useTripPermissions(tripId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  
  // New filter states
  const [selectedArrondissement, setSelectedArrondissement] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [showMap, setShowMap] = useState(true);
  
  // Google Places search
  const { results: searchResults, isSearching, error: searchError, search, clearResults } = usePlaceSearch();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Add to itinerary modal
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [selectedPlaceForItinerary, setSelectedPlaceForItinerary] = useState<Place | null>(null);
  
  // AI Insights
  const { 
    insights: aiInsights, 
    isLoading: aiLoading, 
    generateInsights 
  } = useAIInsights({ tripId, tripTitle, destination });
  
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);
  
  const visibleInsights = aiInsights.filter((_, i) => !dismissedInsights.includes(i));
  
  const handleRefreshInsights = useCallback(() => {
    generateInsights('All Areas', places);
  }, [generateInsights, places]);
  
  const handleDismissInsight = useCallback((index: number) => {
    setDismissedInsights(prev => [...prev, index]);
  }, []);
  
  // Debounced search - triggers immediately for Google Places
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowManualAdd(false);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (canEdit && value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        search(`${value} ${destination || ''}`.trim());
      }, 300);
    } else {
      clearResults();
    }
  }, [search, clearResults, canEdit, destination]);
  
  // Add place from Google search result
  const handleAddFromSearch = useCallback(async (result: import('@/services/placeSearchService').PlaceSearchResult) => {
    if (!canEdit || createPlace.isPending) return;
    if (places.some(place => place.google_place_id === result.id)) {
      toast.info(`"${result.name}" is already saved to this trip.`);
      return;
    }
    try {
      const categoryStr = placeSearchService.mapTypesToCategory(result.types);
      const category = categoryStr as "Attraction" | "Day Trip" | "Experience" | "Food and Drink" | "Lodging" | "Museum" | "Other" | "Shopping" | "Transit";
      const { neighborhood, arrondissement } = placeSearchService.extractNeighborhood(result.address);
      
      await createPlace.mutateAsync({
        trip_id: tripId,
        name: result.name,
        address: result.address || null,
        google_place_id: result.id,
        category,
        neighborhood_name: neighborhood,
        arrondissement,
        latitude: result.lat,
        longitude: result.lng,
        rating: result.rating,
        badge: null,
        area_id: null,
      });
      
      toast.success(`Added "${result.name}" to your trip!`);
      clearResults();
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add place:', error);
      toast.error((error as { code?: string }).code === '23505' ? 'This place is already saved to the trip.' : 'Failed to add place');
    }
  }, [tripId, createPlace, clearResults, canEdit, places]);
  
  // Get unique neighborhoods and arrondissements from places
  const neighborhoods = [...new Set(places.map(p => p.neighborhood_name).filter(Boolean))] as string[];
  const arrondissements = [...new Set(places.map(p => p.arrondissement).filter(Boolean))].sort() as string[];
  
  // Filter places by search query, category, arrondissement, and rating
  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(place.category);
    const matchesSearch = !searchQuery.trim() || searchResults.length > 0 || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.neighborhood_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArrondissement = selectedArrondissement === 'All' || place.arrondissement === selectedArrondissement;
    const matchesRating = minRating === 0 || (place.rating !== null && place.rating >= minRating);
    
    return matchesCategory && matchesSearch && matchesArrondissement && matchesRating;
  });
  
  const groupedPlaces = groupPlacesByArea(filteredPlaces);

  const handleRemovePlace = async (placeId: string) => {
    try {
      await deletePlace.mutateAsync(placeId);
      toast.success('Place removed');
    } catch (error) {
      console.error('Failed to remove place:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedArrondissement('All');
    setMinRating(0);
  };
  
  const handleAddToItinerary = (place: Place) => {
    setSelectedPlaceForItinerary(place);
    setItineraryModalOpen(true);
  };
  
  return (
    <div 
      className="grid flex-1 px-10 pb-10 overflow-y-auto scrollbar-thin"
      style={{ 
        gridTemplateColumns: '1fr 350px',
        gap: '30px'
      }}
    >
      {/* Main Content */}
      <section className="content-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[32px]">
            Neighborhood Explorer
            <span className="text-base font-sans font-normal text-muted-foreground ml-2">
              ({places.length} place{places.length !== 1 ? 's' : ''} saved)
            </span>
          </h2>
        </div>
        
        {/* Search Bar - Primary Action */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={canEdit ? 'Search places to add (e.g., Louvre Museum, Café de Flore...)' : 'Search saved places'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full p-3 pl-10 rounded-xl border border-primary/30 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); clearResults(); setShowManualAdd(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
            
            {/* Google Places search results dropdown */}
            <PlaceSearchResults
              results={canEdit ? searchResults : []}
              isLoading={isSearching}
              onSelect={handleAddFromSearch}
              onClose={clearResults}
            />
          </div>
          
          {/* Status and manual add option */}
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-sm text-muted-foreground">
              {!canEdit ? (
                'Search places saved to this trip'
              ) : searchError ? (
                `Google Places search failed: ${searchError}`
              ) : isSearching ? (
                'Searching Google Places...'
              ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                `No Google Places found for "${searchQuery}"`
              ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
                'Type 2+ characters to search'
              ) : (
                'Start typing to search Google Places'
              )}
            </p>
            {canEdit && !showManualAdd && (
              <button
                onClick={() => setShowManualAdd(true)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Can't find it? Add manually
              </button>
            )}
          </div>
          
          {/* Manual Add Form - Secondary */}
          {canEdit && showManualAdd && (
            <ManualAddForm
              tripId={tripId}
              neighborhoods={neighborhoods}
              onClose={() => setShowManualAdd(false)}
            />
          )}
        </div>

        {/* Map View */}
        {showMap && filteredPlaces.length > 0 && (
          <div className="mb-6">
            <TripMap 
              places={filteredPlaces}
              destination={destination}
              className="h-[300px] rounded-xl overflow-hidden"
            />
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            Loading places...
          </div>
        )}

        {/* Places grouped by area */}
        {!isLoading && Object.entries(groupedPlaces).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>
              No places found
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategories.length > 0 && ` in ${selectedCategories.join(', ')}`}
              {selectedArrondissement !== 'All' && ` in ${selectedArrondissement}`}
              {minRating > 0 && ` with ${minRating}+ stars`}
            </p>
            {(searchQuery || selectedCategories.length > 0 || selectedArrondissement !== 'All' || minRating > 0) && (
              <button 
                onClick={() => { setSearchQuery(''); handleClearFilters(); }}
                className="mt-2 text-primary hover:text-primary/80 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedPlaces).map(([areaName, areaPlaces]) => (
            <div key={areaName} className="mb-8">
              <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                {areaName}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {areaPlaces.map((place) => (
                  <PlaceCard 
                    key={place.id} 
                    place={place} 
                    onRemove={canEdit ? () => handleRemovePlace(place.id) : undefined}
                    onAddToItinerary={canEdit ? () => handleAddToItinerary(place) : undefined}
                    onUpdateNotes={canEdit ? async (notes) => { await updatePlace.mutateAsync({ placeId: place.id, updates: { notes: notes || null } }); } : undefined}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Right Panel with AI Insights and Filters */}
      <aside className="flex flex-col gap-6">
        {/* AI Insights */}
        <InsightsPanel
          insights={visibleInsights}
          isLoading={aiLoading}
          onRefresh={handleRefreshInsights}
          onDismiss={handleDismissInsight}
          neighborhoodFocus="All Areas"
          placesCount={places.length}
        />
        
        {/* Filters */}
        <ExplorerFilters 
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          onClearFilters={handleClearFilters}
          arrondissements={arrondissements}
          selectedArrondissement={selectedArrondissement}
          onArrondissementChange={setSelectedArrondissement}
          minRating={minRating}
          onMinRatingChange={setMinRating}
          showMap={showMap}
          onToggleMap={() => setShowMap(!showMap)}
        />
      </aside>
      
      {/* Add to Itinerary Modal */}
      <AddToItineraryModal
        open={itineraryModalOpen}
        onOpenChange={setItineraryModalOpen}
        tripDays={tripDays}
        place={selectedPlaceForItinerary}
      />
    </div>
  );
}

// ============= MAIN PAGE COMPONENT =============

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  
  const { data: trip, isLoading } = useTrip(tripId);
  const { canEdit } = useTripPermissions(tripId);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [collaboratorsModalOpen, setCollaboratorsModalOpen] = useState(false);
  
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading trip...
        </div>
      </AppShell>
    );
  }
  
  if (!trip) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Trip not found
        </div>
      </AppShell>
    );
  }

  const currentViewName = view === 'itinerary' ? 'Itinerary Builder' : 'Neighborhood Explorer';

  return (
    <AppShell>
      <TopBar 
        trip={trip}
        currentView={currentViewName}
        canEdit={canEdit}
        onEditClick={() => setEditModalOpen(true)}
        onCollaboratorsClick={() => setCollaboratorsModalOpen(true)}
      />
      
      {view === 'itinerary' 
        ? <ItineraryView tripId={trip.id} destination={trip.destination} />
        : <NeighborhoodsView tripId={trip.id} tripTitle={trip.title} destination={trip.destination} />
      }
      
      {/* Edit Trip Modal */}
      <EditTripModal 
        trip={trip} 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen} 
      />
      
      {/* Collaborators Modal */}
      <CollaboratorsModal
        tripId={trip.id}
        open={collaboratorsModalOpen}
        onOpenChange={setCollaboratorsModalOpen}
      />
    </AppShell>
  );
}
