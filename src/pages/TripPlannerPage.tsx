import { AppShell } from '@/components/layout';
import { TopBar } from '@/components/layout/TopBar';

const mockDays = [
  { id: 'd1', label: 'Mon 12', active: true },
  { id: 'd2', label: 'Tue 13', active: false },
  { id: 'd3', label: 'Wed 14', active: false },
  { id: 'd4', label: 'Thu 15', active: false },
  { id: 'd5', label: 'Fri 16', active: false },
];

const mockEvents = [
  { 
    id: 'e1', 
    time: '09:30', 
    title: 'Petit Déjeuner at Café de Flore',
    description: 'Historical landmark. Try the "Chocolat Spécial Flore".',
    badge: '★ 4.5/5 • Iconic'
  },
  { 
    id: 'e2', 
    time: '11:00', 
    title: 'Musée d\'Orsay',
    description: 'Guided tour of the Impressionist level. Entrance via Door C.',
    ticket: { id: 'LV-99201', label: 'View PDF' }
  },
  { 
    id: 'e3', 
    time: '13:30', 
    title: 'Le Train Bleu',
    description: 'Lunch reservation for 2. Art Nouveau interiors.',
    isLast: true
  },
];

function DaySelector() {
  return (
    <div className="flex gap-5 mb-8 border-b border-border pb-4">
      {mockDays.map((day) => (
        <div
          key={day.id}
          className={`day-pill ${day.active ? 'active' : ''}`}
        >
          {day.label}
        </div>
      ))}
    </div>
  );
}

function EventRow({ event }: { event: typeof mockEvents[0] }) {
  return (
    <div className="event-row">
      <div className="event-time">{event.time}</div>
      <div className={`event-details ${event.isLast ? 'border-none' : ''}`}>
        <h4>{event.title}</h4>
        <p className="text-[13px] text-muted-foreground">{event.description}</p>
        
        {event.badge && (
          <span 
            className="inline-block mt-2.5 text-[11px]"
            style={{ color: 'hsl(var(--iron-rust))' }}
          >
            {event.badge}
          </span>
        )}
        
        {event.ticket && (
          <div 
            className="mt-2.5 p-2.5 rounded-lg text-xs"
            style={{ 
              background: '#f9f9f9', 
              borderLeft: '3px solid hsl(var(--amber-glass))' 
            }}
          >
            Ticket ID: {event.ticket.id} • 
            <a href="#" className="text-muted ml-1 hover:underline">
              {event.ticket.label}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function IntelligencePanel() {
  return (
    <aside className="flex flex-col gap-5">
      {/* Mini Map */}
      <div className="mini-map">
        <div className="map-label">Real-time Map</div>
      </div>

      {/* Gem Card - AI Insight */}
      <div className="gem-card">
        <h5 className="font-serif text-xl mb-2.5" style={{ color: 'hsl(var(--amber-glow))' }}>
          Intelligence: Le Marais
        </h5>
        <p className="text-[13px] leading-relaxed opacity-90">
          The archives suggest the <b>Passage des Panoramas</b> is less crowded at this hour. 
          It's a 12-minute walk from your current location.
        </p>
        <button className="btn-nouveau">Reroute Journey</button>
      </div>

      {/* Budget Insight */}
      <div className="insight-card">
        <h5 className="font-serif text-xl mb-4">Budget Insight</h5>
        <div 
          className="h-2.5 rounded mb-2.5 overflow-hidden"
          style={{ background: '#eee' }}
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
  return (
    <AppShell>
      <TopBar />
      
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
          <DaySelector />
          
          <h3 className="font-serif text-[32px] mb-8">Monday in the 6th</h3>
          
          {mockEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </section>

        {/* Intelligence Panel */}
        <IntelligencePanel />
      </div>
    </AppShell>
  );
}
