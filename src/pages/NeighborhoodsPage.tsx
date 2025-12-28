import { AppShell, MainContent, RightPanel } from '@/components/layout';
import { fixturePlaces } from '@/data/fixtures';
import type { Place } from '@/types/place';

// Group places by arrondissement or neighborhood_name
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

function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="content-card hover:shadow-md transition-shadow cursor-pointer group">
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
}

function ExplorerFilters() {
  return (
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
  );
}

export default function NeighborhoodsPage() {
  const groupedPlaces = groupPlacesByArea(fixturePlaces);
  
  return (
    <AppShell rightPanel={<ExplorerFilters />}>
      <MainContent
        title="Neighborhood Explorer"
        subtitle="Discover places across Paris neighborhoods"
      >
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search places..."
              className="w-full p-4 pl-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              ⌕
            </span>
          </div>
        </div>

        {/* Places grouped by area */}
        {Object.entries(groupedPlaces).map(([areaName, places]) => (
          <div key={areaName} className="mb-8">
            <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">
              {areaName}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        ))}
      </MainContent>
    </AppShell>
  );
}
