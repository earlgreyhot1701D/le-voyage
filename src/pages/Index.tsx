import { AppShell } from '@/components/layout';
import { MainContent } from '@/components/layout';
import { RightPanel } from '@/components/layout';
import { Link } from 'react-router-dom';

const mockTrips = [
  {
    id: '1',
    title: 'Paris Adventure',
    destination: 'Paris, France',
    dates: 'Mar 15 - Mar 22, 2025',
    status: 'planning' as const,
    daysCount: 7,
  },
  {
    id: '2',
    title: 'Tokyo Discovery',
    destination: 'Tokyo, Japan',
    dates: 'May 10 - May 20, 2025',
    status: 'upcoming' as const,
    daysCount: 10,
  },
];

const statusColors = {
  planning: 'bg-accent/20 text-accent',
  upcoming: 'bg-primary/20 text-primary',
  in_progress: 'bg-green-500/20 text-green-700',
  completed: 'bg-muted text-muted-foreground',
};

function TripCard({ trip }: { trip: typeof mockTrips[0] }) {
  return (
    <Link
      to={`/planner?trip=${trip.id}`}
      className="content-card block hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-serif text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {trip.title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[trip.status]}`}>
          {trip.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-muted-foreground mb-2">{trip.destination}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{trip.dates}</span>
        <span>•</span>
        <span>{trip.daysCount} days</span>
      </div>
    </Link>
  );
}

function QuickActions() {
  return (
    <RightPanel title="Quick Actions">
      <div className="space-y-3">
        <Link
          to="/planner"
          className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <span className="text-xl">✦</span>
          <div>
            <p className="font-medium text-foreground">New Itinerary</p>
            <p className="text-sm text-muted-foreground">Start planning a trip</p>
          </div>
        </Link>
        <Link
          to="/neighborhoods"
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <span className="text-xl">☖</span>
          <div>
            <p className="font-medium text-foreground">Explore Areas</p>
            <p className="text-sm text-muted-foreground">Discover neighborhoods</p>
          </div>
        </Link>
        <Link
          to="/packing"
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <span className="text-xl">✕</span>
          <div>
            <p className="font-medium text-foreground">Packing Lists</p>
            <p className="text-sm text-muted-foreground">Prepare for your trip</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="font-serif font-semibold text-card-foreground mb-3">
          Upcoming
        </h3>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-background">
            <p className="font-medium text-sm">Paris Adventure</p>
            <p className="text-xs text-muted-foreground">Starts in 77 days</p>
          </div>
        </div>
      </div>
    </RightPanel>
  );
}

export default function Index() {
  return (
    <AppShell rightPanel={<QuickActions />}>
      <MainContent
        title="Your Trips"
        subtitle="Plan, organize, and explore your upcoming adventures"
      >
        <div className="space-y-4">
          {mockTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>

        <div className="mt-8">
          <button className="w-full p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <span className="text-2xl block mb-2">+</span>
            <span className="font-medium">Create New Trip</span>
          </button>
        </div>
      </MainContent>
    </AppShell>
  );
}