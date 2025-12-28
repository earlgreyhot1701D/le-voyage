import { AppShell } from '@/components/layout';
import { MainContent } from '@/components/layout';
import { Link } from 'react-router-dom';
import { fixtureTrip } from '@/data/fixtures';
import { FIXTURE_TRIP_ID } from '@/config/constants';

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
      to={`/trip/${FIXTURE_TRIP_ID}`}
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

export default function Index() {
  return (
    <AppShell>
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
