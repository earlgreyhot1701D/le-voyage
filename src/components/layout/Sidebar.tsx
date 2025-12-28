import { useLocation, useSearchParams } from 'react-router-dom';
import { NavSection } from '../navigation/NavSection';
import { NavItem } from '../navigation/NavItem';
import { CurrentLocation } from '../navigation/CurrentLocation';
import { FIXTURE_TRIP_ID } from '@/config/constants';

export function Sidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Compute active state based on location and query params
  const view = searchParams.get('view');
  const inTrip = location.pathname.startsWith('/trip/');
  
  const NAV_SECTIONS = [
    {
      title: 'Trip Planning',
      items: [
        { 
          icon: '✦', 
          label: 'Itinerary Builder', 
          path: `/trip/${FIXTURE_TRIP_ID}`,
          isActive: inTrip && view !== 'neighborhoods',
          disabled: false,
          comingSoon: false
        },
        { 
          icon: '☖', 
          label: 'Neighborhood Explorer', 
          path: `/trip/${FIXTURE_TRIP_ID}?view=neighborhoods`,
          isActive: inTrip && view === 'neighborhoods',
          disabled: false,
          comingSoon: false
        },
        { 
          icon: '⧖', 
          label: 'Budget & Expenses', 
          path: null,
          isActive: false,
          disabled: true,
          comingSoon: true
        },
      ],
    },
    {
      title: 'Documents',
      items: [
        { 
          icon: '✉', 
          label: 'Reservations', 
          path: null,
          isActive: false,
          disabled: true,
          comingSoon: true
        },
        { 
          icon: '⚓', 
          label: 'Travel Insurance', 
          path: null,
          isActive: false,
          disabled: true,
          comingSoon: true
        },
      ],
    },
  ];

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
                key={item.label}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={item.isActive}
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
