import { NavSection } from '../navigation/NavSection';
import { NavItem } from '../navigation/NavItem';
import { CurrentLocation } from '../navigation/CurrentLocation';

const NAV_SECTIONS = [
  {
    title: 'TRIP PLANNING',
    items: [
      { icon: '✦', label: 'Itinerary Builder', path: '/planner', active: false },
      { icon: '☖', label: 'Neighborhood Explorer', path: '/neighborhoods', active: false },
      { icon: '✕', label: 'Packing Lists', path: '/packing', active: false },
    ],
  },
  {
    title: 'TRIP MANAGEMENT',
    items: [
      { icon: '✉', label: 'Travel Documents', path: '/documents', active: false },
      { icon: '$', label: 'Budget & Expenses', path: '/budget', disabled: true, comingSoon: true },
      { icon: '⌂', label: 'Reservations', path: '/reservations', disabled: true, comingSoon: true },
    ],
  },
  {
    title: 'SAFETY & SUPPORT',
    items: [
      { icon: '☂', label: 'Travel Insurance', path: '/insurance', disabled: true, comingSoon: true },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-sidebar flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="font-serif text-2xl font-semibold tracking-wide">
          Le Voyage
        </h1>
      </div>
      
      {/* Current Location */}
      <CurrentLocation 
        city="Paris" 
        neighborhood="Le Marais" 
      />
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <NavSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={item.active}
                disabled={item.disabled}
                comingSoon={item.comingSoon}
              />
            ))}
          </NavSection>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-5 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Traveler</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">View Profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}