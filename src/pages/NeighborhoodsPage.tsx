import { AppShell, MainContent, RightPanel } from '@/components/layout';

const mockNeighborhoods = [
  {
    id: 'n1',
    name: 'Le Marais',
    city: 'Paris',
    description: 'Historic district known for its medieval architecture, trendy boutiques, and vibrant LGBTQ+ scene.',
    vibeTags: ['Historic', 'Trendy', 'Artsy'],
    walkability: 95,
  },
  {
    id: 'n2',
    name: 'Montmartre',
    city: 'Paris',
    description: 'Bohemian hilltop neighborhood famous for Sacré-Cœur basilica and its artistic heritage.',
    vibeTags: ['Artistic', 'Romantic', 'Historic'],
    walkability: 75,
  },
  {
    id: 'n3',
    name: 'Saint-Germain-des-Prés',
    city: 'Paris',
    description: 'Intellectual heart of Paris with legendary cafés, bookshops, and upscale galleries.',
    vibeTags: ['Upscale', 'Literary', 'Classic'],
    walkability: 90,
  },
];

function NeighborhoodCard({ neighborhood }: { neighborhood: typeof mockNeighborhoods[0] }) {
  return (
    <div className="content-card hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {neighborhood.name}
          </h3>
          <p className="text-sm text-muted-foreground">{neighborhood.city}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-primary">{neighborhood.walkability}</p>
          <p className="text-xs text-muted-foreground">Walkability</p>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4 line-clamp-2">
        {neighborhood.description}
      </p>
      
      <div className="flex gap-2 flex-wrap">
        {neighborhood.vibeTags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExplorerFilters() {
  return (
    <RightPanel title="Filters">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <select className="w-full p-2 rounded-lg border border-border bg-background text-foreground">
            <option>Paris</option>
            <option>Tokyo</option>
            <option>New York</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vibe</label>
          <div className="space-y-2">
            {['Historic', 'Trendy', 'Artsy', 'Romantic', 'Upscale'].map((vibe) => (
              <label key={vibe} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm">{vibe}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Walkability</label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Any</span>
            <span>Highly Walkable</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-serif font-semibold mb-3">AI Insights</h3>
        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p>AI-powered neighborhood insights will be available in Phase 2.</p>
        </div>
      </div>
    </RightPanel>
  );
}

export default function NeighborhoodsPage() {
  return (
    <AppShell rightPanel={<ExplorerFilters />}>
      <MainContent
        title="Neighborhood Explorer"
        subtitle="Discover the character of different areas"
      >
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search neighborhoods..."
              className="w-full p-4 pl-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              ⌕
            </span>
          </div>
        </div>

        {/* Neighborhood Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {mockNeighborhoods.map((neighborhood) => (
            <NeighborhoodCard key={neighborhood.id} neighborhood={neighborhood} />
          ))}
        </div>
      </MainContent>
    </AppShell>
  );
}