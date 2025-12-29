import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { NavSection } from '../navigation/NavSection';
import { NavItem } from '../navigation/NavItem';
import { CurrentLocation } from '../navigation/CurrentLocation';
import { CreateTripModal } from '../trips/CreateTripModal';
import { Plus, Map, Compass, Wallet, Mail, Shield, Home } from 'lucide-react';
import { Button } from '../ui/button';

export function Sidebar() {
  const location = useLocation();
  const { tripId } = useParams<{ tripId: string }>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Compute active state based on location and query params
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get('view');
  const isHomePage = location.pathname === '/';
  const inTrip = location.pathname.startsWith('/trip/') && tripId;
  
  // Trip-specific navigation (only shown when viewing a trip)
  const TRIP_NAV_SECTIONS = [
    {
      title: 'Trip Planning',
      items: [
        { 
          icon: Compass, 
          label: 'Itinerary Builder', 
          path: `/trip/${tripId}`,
          isActive: inTrip && view !== 'neighborhoods',
        },
        { 
          icon: Map, 
          label: 'Neighborhood Explorer', 
          path: `/trip/${tripId}?view=neighborhoods`,
          isActive: inTrip && view === 'neighborhoods',
        },
        { 
          icon: Wallet, 
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
          icon: Mail, 
          label: 'Reservations', 
          path: null,
          isActive: false,
          disabled: true,
          comingSoon: true
        },
        { 
          icon: Shield, 
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
    <>
      <aside className="w-sidebar flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-full px-5 py-10 border-r-2 border-sidebar-border">
        {/* Logo - clickable, links to home */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-serif text-[38px] italic text-sidebar-primary">
              Le Voyage
            </h1>
          </Link>
        </div>
        
        {/* New Trip Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mb-8 w-full gap-2"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </Button>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin">
          {/* My Trips - always visible */}
          <NavSection title="Dashboard">
            <NavItem
              icon={Home}
              label="My Trips"
              path="/"
              isActive={isHomePage}
            />
          </NavSection>
          
          {/* Trip-specific navigation - only show when in a trip */}
          {inTrip && TRIP_NAV_SECTIONS.map((section, index) => (
            <NavSection 
              key={section.title} 
              title={section.title}
              className="mt-10"
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
        
        {/* Currently In - at bottom, only show when in a trip */}
        {inTrip && (
          <CurrentLocation 
            neighborhood="Saint-Germain-des-Prés" 
          />
        )}
      </aside>
      
      <CreateTripModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  );
}
