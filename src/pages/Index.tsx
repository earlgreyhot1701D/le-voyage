import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { MainContent } from '@/components/layout';
import { CreateTripModal } from '@/components/trips';
import { useTrips } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Plane } from 'lucide-react';
import type { Trip } from '@/services/tripService';

const statusColors: Record<string, string> = {
  planning: 'bg-accent/20 text-accent',
  upcoming: 'bg-primary/20 text-primary',
  in_progress: 'bg-green-500/20 text-green-700',
  completed: 'bg-muted text-muted-foreground',
};

function TripCard({ trip }: { trip: Trip }) {
  const startDate = trip.start_date ? new Date(trip.start_date) : null;
  const endDate = trip.end_date ? new Date(trip.end_date) : null;

  const dateRange =
    startDate && endDate
      ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'Dates TBD';

  const daysCount =
    startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0;

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="content-card block hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-serif text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {trip.title}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[trip.status] || statusColors.planning}`}
        >
          {trip.status.replace('_', ' ')}
        </span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <MapPin className="h-4 w-4" />
        <span>{trip.destination}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{dateRange}</span>
        {daysCount > 0 && (
          <>
            <span>•</span>
            <span>{daysCount} days</span>
          </>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ onCreateTrip }: { onCreateTrip: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Plane className="h-10 w-10 text-primary" />
      </div>
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
        No trips yet
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Start planning your next adventure. Create a trip to organize your itinerary, 
        save places, and keep everything in one place.
      </p>
      <Button onClick={onCreateTrip} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Create Your First Trip
      </Button>
    </div>
  );
}

export default function Index() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: trips, isLoading, error } = useTrips();

  const hasTrips = trips && trips.length > 0;

  return (
    <AppShell>
      <MainContent
        title="Your Trips"
        subtitle="Plan, organize, and explore your upcoming adventures"
      >
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            Loading your trips...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">
            Failed to load trips. Please try again.
          </div>
        )}

        {!isLoading && !error && !hasTrips && (
          <EmptyState onCreateTrip={() => setShowCreateModal(true)} />
        )}

        {!isLoading && hasTrips && (
          <>
            <div className="space-y-4">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <span className="text-2xl block mb-2">+</span>
                <span className="font-medium">Create New Trip</span>
              </button>
            </div>
          </>
        )}
      </MainContent>

      <CreateTripModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </AppShell>
  );
}
