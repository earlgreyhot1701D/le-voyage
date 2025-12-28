import { AppShell, MainContent, RightPanel } from '@/components/layout';
import { EmptyState } from '@/components/common';

const mockDays = [
  { id: 'd1', dayNumber: 1, date: 'Mar 15', title: 'Arrival & Montmartre' },
  { id: 'd2', dayNumber: 2, date: 'Mar 16', title: 'Louvre & Marais' },
  { id: 'd3', dayNumber: 3, date: 'Mar 17', title: 'Versailles Day Trip' },
];

const mockActivities = [
  { id: 'a1', time: '14:00', title: 'Check into Hotel', location: 'Le Marais', category: 'accommodation' },
  { id: 'a2', time: '16:00', title: 'Explore Montmartre', location: 'Montmartre', category: 'activity' },
  { id: 'a3', time: '19:30', title: 'Dinner at Le Petit Cler', location: 'Rue Cler', category: 'food' },
];

const categoryIcons: Record<string, string> = {
  accommodation: '⌂',
  activity: '✦',
  food: '◉',
  transport: '→',
  other: '•',
};

function DayPills() {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {mockDays.map((day, index) => (
        <button
          key={day.id}
          className={`day-pill ${index === 0 ? '' : 'bg-secondary text-secondary-foreground'}`}
        >
          <span className="font-semibold">Day {day.dayNumber}</span>
          <span className="opacity-70">{day.date}</span>
        </button>
      ))}
      <button className="px-4 py-2 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        + Add Day
      </button>
    </div>
  );
}

function ActivityCard({ activity }: { activity: typeof mockActivities[0] }) {
  return (
    <div className="content-card flex items-start gap-4 group hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-primary">{activity.time}</span>
        <div className="w-px h-8 bg-border mt-2" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{categoryIcons[activity.category] || '•'}</span>
          <h4 className="font-medium text-foreground">{activity.title}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{activity.location}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
        ⋮
      </button>
    </div>
  );
}

function TripDetails() {
  return (
    <RightPanel title="Trip Details">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Destination</p>
          <p className="font-medium">Paris, France</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Dates</p>
          <p className="font-medium">Mar 15 - Mar 22, 2025</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Duration</p>
          <p className="font-medium">7 days</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-serif font-semibold mb-3">Day 1 Summary</h3>
        <p className="text-sm text-muted-foreground">
          Arrival & Montmartre exploration. 3 activities planned.
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-serif font-semibold mb-3">Map Preview</h3>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
          <span className="text-sm">Map available in Phase 2</span>
        </div>
      </div>
    </RightPanel>
  );
}

export default function TripPlannerPage() {
  const hasActivities = mockActivities.length > 0;

  return (
    <AppShell rightPanel={<TripDetails />}>
      <MainContent
        title="Paris Adventure"
        subtitle="March 15 - 22, 2025"
      >
        <DayPills />

        {hasActivities ? (
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
            
            <button className="w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + Add Activity
            </button>
          </div>
        ) : (
          <EmptyState
            icon="✦"
            title="No activities yet"
            description="Start building your itinerary by adding activities to your day."
            action={{
              label: 'Add First Activity',
              onClick: () => console.log('Add activity'),
            }}
          />
        )}
      </MainContent>
    </AppShell>
  );
}