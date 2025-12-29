import { useState, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { TopBar } from '@/components/layout/TopBar';
import { RightPanel } from '@/components/layout/RightPanel';
import { 
  fixtureTrip, 
  fixtureTripDays, 
  fixtureItineraryItems, 
  fixturePlaces,
  fixtureInsights 
} from '@/data/fixtures';
import type { TripDay } from '@/types/trip';
import type { ItineraryItem } from '@/types/itinerary';
import type { Place } from '@/types/place';

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
  return (
    <div className="flex gap-5 mb-8 border-b border-border pb-4">
      {days.map((day) => (
        <button
          key={day.id}
          onClick={() => onSelectDay(day.id)}
          className={`day-pill ${day.id === selectedDayId ? 'active' : ''}`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

function EventRow({ item, isLast }: { item: ItineraryItem; isLast: boolean }) {
  const place = fixturePlaces.find(p => p.id === item.place_id);
  
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
        
        {/* Ticket info */}
        {item.ticket && (
          <div 
            className="mt-2.5 p-2.5 rounded-lg text-xs"
            style={{ 
              background: 'hsl(var(--card))', 
              borderLeft: '3px solid hsl(var(--amber-glass))' 
            }}
          >
            Ticket ID: {item.ticket.id} • 
            <a href={item.ticket.pdf_url} className="text-muted ml-1 hover:underline">
              View PDF
            </a>
          </div>
        )}
        
        {/* Attribution */}
        {item.added_by_display_name && (
          <p className="text-[11px] text-muted-foreground mt-2 opacity-70">
            Added by {item.added_by_display_name}
          </p>
        )}
      </div>
    </div>
  );
}

function IntelligencePanel({ neighborhoodFocus }: { neighborhoodFocus: string }) {
  const insight = fixtureInsights.find(i => i.neighborhood_focus === neighborhoodFocus);
  
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
          <button className="btn-nouveau">{insight.action_label}</button>
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

function ItineraryView() {
  const [selectedDayId, setSelectedDayId] = useState(fixtureTripDays[0].id);
  
  const selectedDay = fixtureTripDays.find(d => d.id === selectedDayId) || fixtureTripDays[0];
  const dayItems = fixtureItineraryItems.filter(item => item.trip_day_id === selectedDayId);

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
          days={fixtureTripDays} 
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
        />
        
        <h3 className="font-serif text-[32px] mb-8">{selectedDay.title}</h3>
        
        {dayItems.map((item, index) => (
          <EventRow 
            key={item.id} 
            item={item} 
            isLast={index === dayItems.length - 1}
          />
        ))}
        
        {dayItems.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No activities planned for this day yet.
          </p>
        )}
      </section>

      {/* Intelligence Panel */}
      <IntelligencePanel neighborhoodFocus={selectedDay.neighborhood_focus || ''} />
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

const PlaceCard = forwardRef<HTMLDivElement, { place: Place }>(({ place }, ref) => {
  return (
    <div ref={ref} className="content-card hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          <p className="text-sm text-muted-foreground">{place.neighborhood_name}</p>
        </div>
        {place.rating && (
          <div className="text-right">
            <p className="text-2xl font-semibold text-primary">{place.rating}</p>
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
    </div>
  );
});
PlaceCard.displayName = 'PlaceCard';

const ExplorerFilters = forwardRef<HTMLDivElement, object>((_, ref) => {
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
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="space-y-2">
              {['Food and Drink', 'Museum', 'Attraction', 'Experience'].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm">{cat}</span>
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
});
ExplorerFilters.displayName = 'ExplorerFilters';

function AddPlaceForm({ onAddPlace }: { onAddPlace: (place: Place) => void }) {
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  // Get unique neighborhoods from existing places
  const neighborhoods = [...new Set(fixturePlaces.map(p => p.neighborhood_name).filter(Boolean))] as string[];

  const handleSubmit = () => {
    if (!name.trim()) return;

    const newPlace: Place = {
      id: `place-user-${Date.now()}`,
      name: name.trim(),
      arrondissement: null,
      neighborhood_name: neighborhood || null, // Allow empty - goes to "To Sort" group
      category: 'Other',
      rating: null,
      badge: null,
      area_id: null,
    };

    onAddPlace(newPlace);
    setName('');
    setNeighborhood('');
  };

  return (
    <div className="mb-6 p-4 border border-border rounded-xl bg-card">
      <h4 className="font-serif text-lg mb-3">Add a Place</h4>
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
          disabled={!name.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Don't know the neighborhood? No problem — add it now, organize later.
      </p>
    </div>
  );
}

function NeighborhoodsView() {
  const [addedPlaces, setAddedPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allPlaces = [...fixturePlaces, ...addedPlaces];
  
  // Filter places by search query
  const filteredPlaces = searchQuery.trim()
    ? allPlaces.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.neighborhood_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPlaces;
  
  const groupedPlaces = groupPlacesByArea(filteredPlaces);

  const handleAddPlace = (place: Place) => {
    setAddedPlaces(prev => [...prev, place]);
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
        <AddPlaceForm onAddPlace={handleAddPlace} />
        
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

        {/* Places grouped by area */}
        {Object.entries(groupedPlaces).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No places found matching "{searchQuery}"</p>
          </div>
        ) : (
          Object.entries(groupedPlaces).map(([areaName, places]) => (
            <div key={areaName} className="mb-8">
              <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">
                {areaName}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Filters Panel */}
      <ExplorerFilters />
    </div>
  );
}

// ============= MAIN PAGE COMPONENT =============

export default function TripDetailPage() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  
  // Format date for TopBar (April 2025)
  const tripDate = fixtureTrip.start_date 
    ? new Date(fixtureTrip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'April 2025';

  return (
    <AppShell>
      <TopBar date={tripDate} />
      
      {view === 'neighborhoods' ? <NeighborhoodsView /> : <ItineraryView />}
    </AppShell>
  );
}
