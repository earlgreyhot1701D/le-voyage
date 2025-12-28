import { NavSection } from '../navigation/NavSection';
import { NavItem } from '../navigation/NavItem';
import { CurrentLocation } from '../navigation/CurrentLocation';

const NAV_SECTIONS = [
  {
    title: 'Trip Planning',
    items: [
      { icon: '✦', label: 'Itinerary Builder', path: '/planner', active: true },
      { icon: '☖', label: 'Neighborhood Explorer', path: '/neighborhoods', active: false },
      { icon: '⧖', label: 'Budget & Expenses', path: '/budget', disabled: true, comingSoon: true },
    ],
  },
  {
    title: 'Documents',
    items: [
      { icon: '✉', label: 'Reservations', path: '/reservations', disabled: true, comingSoon: true },
      { icon: '⚓', label: 'Travel Insurance', path: '/insurance', disabled: true, comingSoon: true },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-sidebar flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-full px-5 py-10 border-r-2 border-sidebar-border">
      {/* Logo - italic, amber-glass, centered */}
      <div className="mb-10 text-center">
        <h1 className="font-serif text-[38px] italic text-sidebar-primary">
          Le Voyage
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin">
        {NAV_SECTIONS.map((section, index) => (
          <NavSection 
            key={section.title} 
            title={section.title}
            className={index > 0 ? 'mt-10' : ''}
          >
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
      
      {/* Currently In - at bottom */}
      <CurrentLocation 
        neighborhood="Saint-Germain-des-Prés" 
      />
    </aside>
  );
}
