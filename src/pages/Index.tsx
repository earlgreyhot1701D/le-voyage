import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { MainContent } from '@/components/layout';
import { CreateTripModal } from '@/components/trips';
import { useTrips } from '@/hooks/useTrips';
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
      <p className="text-muted-foreground mb-2">{trip.destination}</p>
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

export default function Index() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: trips, isLoading, error } = useTrips();

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

        {!isLoading && !error && trips && trips.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">You don't have any trips yet.</p>
            <p>Create your first trip to get started!</p>
          </div>
        )}

        {!isLoading && trips && trips.length > 0 && (
          <div className="space-y-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <span className="text-2xl block mb-2">+</span>
            <span className="font-medium">Create New Trip</span>
          </button>
        </div>
      </MainContent>

      <CreateTripModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </AppShell>
  );
}
