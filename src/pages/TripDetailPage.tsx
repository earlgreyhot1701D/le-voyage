import { useState, forwardRef, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { TopBar } from '@/components/layout/TopBar';
import { RightPanel } from '@/components/layout/RightPanel';
import { useTrip, useTripDays, useItineraryItems, useInsights } from '@/hooks/useTrips';
import { usePlaces, useCreatePlace, useDeletePlace } from '@/hooks/usePlaces';
import { useTripPermissions } from '@/hooks/useTripPermissions';
import { useAIInsights } from '@/hooks/useAIInsights';
import { EditTripModal, CollaboratorsModal } from '@/components/trips';
import { InsightsPanel } from '@/components/insights';
import type { Tables } from '@/integrations/supabase/types';

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
  insights 
}: { 
  neighborhoodFocus: string;
  insights: Insight[];
}) {
  const insight = insights.find(i => i.neighborhood_focus === neighborhoodFocus);
  
  return (
    <aside className="flex flex-col gap-5">
      {/* Mini Map */}
      <div className="mini-map">
        <div className="map-label">Real-time Map</div>
      </div>

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

function ItineraryView({ tripId }: { tripId: string }) {
  const { data: tripDays = [], isLoading: daysLoading } = useTripDays(tripId);
  const { data: places = [] } = usePlaces(tripId);
  const { data: insights = [] } = useInsights(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  
  // Select first day when days load
  const effectiveDayId = selectedDayId || tripDays[0]?.id;
  
  const { data: items = [], isLoading: itemsLoading } = useItineraryItems(effectiveDayId);
  
  const selectedDay = tripDays.find(d => d.id === effectiveDayId);

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
}

const PlaceCard = forwardRef<HTMLDivElement, PlaceCardProps>(({ place, onRemove }, ref) => {
  return (
    <div ref={ref} className="content-card hover:shadow-md transition-shadow cursor-pointer group relative">
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center text-xs font-medium opacity-0 group-hover:opacity-100"
          title="Remove place"
        >
          ✕
        </button>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          <p className="text-sm text-muted-foreground">{place.neighborhood_name}</p>
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

const CATEGORIES = ['Food and Drink', 'Museum', 'Attraction', 'Experience'] as const;

interface ExplorerFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

const ExplorerFilters = forwardRef<HTMLDivElement, ExplorerFiltersProps>(
  ({ selectedCategories, onCategoryChange, onClearFilters }, ref) => {
    const hasActiveFilters = selectedCategories.length > 0;
    
    return (
      <div ref={ref}>
        <RightPanel title="Filters">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Arrondissement</label>
              <select className="w-full p-2 rounded-lg border border-border bg-background text-foreground">
                <option>All</option>
                <option>4th</option>
                <option>6th</option>
                <option>7th</option>
                <option>12th</option>
                <option>18th</option>
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
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2">
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
              <label className="block text-sm font-medium mb-2">Rating</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                defaultValue="0"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Any</span>
                <span>5 Stars</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-serif font-semibold mb-3">AI Insights</h3>
            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p>AI-powered neighborhood insights coming in Phase 2.</p>
            </div>
          </div>
        </RightPanel>
      </div>
    );
  }
);
ExplorerFilters.displayName = 'ExplorerFilters';

interface AddPlaceFormProps {
  tripId: string;
  neighborhoods: string[];
  placesCount: number;
}

function AddPlaceForm({ tripId, neighborhoods, placesCount }: AddPlaceFormProps) {
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const createPlace = useCreatePlace();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      await createPlace.mutateAsync({
        trip_id: tripId,
        name: name.trim(),
        arrondissement: null,
        neighborhood_name: neighborhood || null,
        category: 'Other',
        rating: null,
        badge: null,
        area_id: null,
        latitude: null,
        longitude: null,
      });
      
      setName('');
      setNeighborhood('');
    } catch (error) {
      console.error('Failed to add place:', error);
    }
  };

  return (
    <div className="mb-6 p-4 border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-serif text-lg">Add a Place</h4>
        <span className="text-xs text-muted-foreground">
          {placesCount} place{placesCount !== 1 ? 's' : ''} saved
        </span>
      </div>
      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Place name (e.g., Café de Flore)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full p-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="p-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="">Neighborhood (optional)</option>
            {neighborhoods.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || createPlace.isPending}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createPlace.isPending ? 'Adding...' : 'Add'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Don't know the neighborhood? No problem — add it now, organize later.
      </p>
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
  const deletePlace = useDeletePlace(tripId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
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
  
  // Get unique neighborhoods from places
  const neighborhoods = [...new Set(places.map(p => p.neighborhood_name).filter(Boolean))] as string[];
  
  // Filter places by search query and category
  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(place.category);
    const matchesSearch = !searchQuery.trim() || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.neighborhood_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  const groupedPlaces = groupPlacesByArea(filteredPlaces);

  const handleRemovePlace = async (placeId: string) => {
    try {
      await deletePlace.mutateAsync(placeId);
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
        <h2 className="font-serif text-[32px] mb-6">Neighborhood Explorer</h2>
        <p className="text-muted-foreground mb-8">Discover places across Paris neighborhoods</p>
        
        {/* Add Place Form */}
        <AddPlaceForm 
          tripId={tripId}
          neighborhoods={neighborhoods}
          placesCount={places.length}
        />
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search places, neighborhoods, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              ⌕
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

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
            </p>
            {(searchQuery || selectedCategories.length > 0) && (
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
                    onRemove={() => handleRemovePlace(place.id)}
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
        />
      </aside>
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

  const tripDate = trip.start_date 
    ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Dates TBD';

  return (
    <AppShell>
      <TopBar 
        date={tripDate} 
        canEdit={canEdit}
        onEditClick={() => setEditModalOpen(true)}
        onCollaboratorsClick={() => setCollaboratorsModalOpen(true)}
      />
      
      {view === 'neighborhoods' 
        ? <NeighborhoodsView tripId={trip.id} tripTitle={trip.title} destination={trip.destination} /> 
        : <ItineraryView tripId={trip.id} />
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
