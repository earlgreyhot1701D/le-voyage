import { AppShell } from '@/components/layout';
import { MainContent } from '@/components/layout';
import { RightPanel } from '@/components/layout';
import { Link } from 'react-router-dom';
import { fixtureTrip } from '@/data/fixtures';

const statusColors = {
  planning: 'bg-accent/20 text-accent',
  upcoming: 'bg-primary/20 text-primary',
  in_progress: 'bg-green-500/20 text-green-700',
  completed: 'bg-muted text-muted-foreground',
};

function TripCard() {
  // Format dates for display
  const startDate = fixtureTrip.start_date 
    ? new Date(fixtureTrip.start_date) 
    : null;
  const endDate = fixtureTrip.end_date 
    ? new Date(fixtureTrip.end_date) 
    : null;
  
  const dateRange = startDate && endDate
    ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Dates TBD';
  
  const daysCount = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <Link
      to="/planner"
      className="content-card block hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-serif text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {fixtureTrip.title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[fixtureTrip.status]}`}>
          {fixtureTrip.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-muted-foreground mb-2">{fixtureTrip.destination}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{dateRange}</span>
        <span>•</span>
        <span>{daysCount} days</span>
      </div>
    </Link>
  );
}

function QuickActions() {
  // Calculate days until trip
  const startDate = fixtureTrip.start_date 
    ? new Date(fixtureTrip.start_date) 
    : null;
  const today = new Date();
  const daysUntil = startDate 
    ? Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

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
            <p className="font-medium text-sm">{fixtureTrip.title}</p>
            <p className="text-xs text-muted-foreground">
              {daysUntil > 0 ? `Starts in ${daysUntil} days` : 'Trip in progress'}
            </p>
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
          <TripCard />
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
