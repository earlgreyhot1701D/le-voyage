import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { TopBar } from '@/components/layout/TopBar';
import { 
  fixtureTrip, 
  fixtureTripDays, 
  fixtureItineraryItems, 
  fixturePlaces,
  fixtureInsights 
} from '@/data/fixtures';
import type { TripDay } from '@/types/trip';
import type { ItineraryItem } from '@/types/itinerary';

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

export default function TripPlannerPage() {
  const [selectedDayId, setSelectedDayId] = useState(fixtureTripDays[0].id);
  
  const selectedDay = fixtureTripDays.find(d => d.id === selectedDayId) || fixtureTripDays[0];
  const dayItems = fixtureItineraryItems.filter(item => item.trip_day_id === selectedDayId);
  
  // Format date for TopBar (April 2025)
  const tripDate = fixtureTrip.start_date 
    ? new Date(fixtureTrip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'April 2025';

  return (
    <AppShell>
      <TopBar date={tripDate} />
      
      {/* Dashboard Grid - matches HTML exactly */}
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
    </AppShell>
  );
}
