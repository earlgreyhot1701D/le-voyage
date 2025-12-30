import { useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { NavSection } from '../navigation/NavSection';
import { NavItem } from '../navigation/NavItem';
import { CreateTripModal } from '../trips/CreateTripModal';
import { Plus, Map, Compass, Wallet, Mail, Shield, Home, MapPin, Calendar } from 'lucide-react';
import { useTrip } from '@/hooks/useTrips';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';

interface SidebarProps {
  onNavigate?: () => void;
}

function CurrentTripCard({ tripId, onNavigate }: { tripId: string; onNavigate?: () => void }) {
  const { data: trip, isLoading } = useTrip(tripId);
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="mb-6 p-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border">
        <Skeleton className="h-4 w-3/4 mb-2 bg-sidebar-accent/50" />
        <Skeleton className="h-3 w-1/2 mb-1 bg-sidebar-accent/50" />
        <Skeleton className="h-3 w-2/3 bg-sidebar-accent/50" />
      </div>
    );
  }
  
  if (!trip) return null;
  
  const formatDateRange = () => {
    if (!trip.start_date || !trip.end_date) return 'Dates not set';
    const start = format(new Date(trip.start_date), 'MMM d');
    const end = format(new Date(trip.end_date), 'MMM d, yyyy');
    return `${start} - ${end}`;
  };
  
  return (
    <button
      onClick={() => {
        navigate(`/trip/${tripId}?view=neighborhoods`);
        onNavigate?.();
      }}
      className="mb-6 w-full p-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border hover:bg-sidebar-accent/50 transition-colors text-left group"
    >
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-sidebar-primary mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sidebar-foreground truncate group-hover:text-sidebar-primary transition-colors">
            {trip.title}
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            {trip.destination}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-sidebar-foreground/50">
            <Calendar className="h-3 w-3" />
            <span>{formatDateRange()}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Compute active state based on location and query params
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get('view');
  const isHomePage = location.pathname === '/';
  const inTrip = location.pathname.startsWith('/trip/') && tripId;
  
  // Handle navigation with callback for mobile drawer
  const handleNavigation = (path: string | null) => {
    if (path) {
      navigate(path);
      onNavigate?.();
    }
  };
  
  // Trip-specific navigation (only shown when viewing a trip)
  const TRIP_NAV_SECTIONS = [
    {
      title: 'Trip Planning',
      items: [
        { 
          icon: Map, 
          label: 'Neighborhood Explorer', 
          path: `/trip/${tripId}?view=neighborhoods`,
          isActive: inTrip && view === 'neighborhoods',
        },
        { 
          icon: Compass, 
          label: 'Itinerary Builder', 
          path: `/trip/${tripId}?view=itinerary`,
          isActive: inTrip && view === 'itinerary',
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
          <Link 
            to="/" 
            className="inline-block hover:opacity-80 transition-opacity"
            onClick={() => onNavigate?.()}
          >
            <h1 className="font-serif text-[38px] italic text-sidebar-primary">
              Le Voyage
            </h1>
          </Link>
        </div>
        
        {/* New Trip Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mb-6 w-full gap-2"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </Button>
        
        {/* Current Trip Card - only show when in a trip */}
        {inTrip && <CurrentTripCard tripId={tripId} onNavigate={onNavigate} />}
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin">
          {/* My Trips - always visible */}
          <NavSection title="Dashboard">
            <NavItem
              icon={Home}
              label="My Trips"
              path="/"
              isActive={isHomePage}
              onClick={() => handleNavigation('/')}
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
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </NavSection>
          ))}
        </nav>
      </aside>
      
      <CreateTripModal 
        open={showCreateModal} 
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) onNavigate?.();
        }} 
      />
    </>
  );
}
