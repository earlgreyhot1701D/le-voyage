import { ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { useTrip } from '@/hooks/useTrips';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tripId } = useParams<{ tripId: string }>();
  const { data: trip } = useTrip(tripId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile: Sheet-based sidebar */}
      {isMobile ? (
        <>
          {/* Floating menu bar with trip context */}
          <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button 
                  className="w-10 h-10 rounded-full bg-sidebar border-2 border-sidebar-border shadow-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar/90 transition-colors flex-shrink-0"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r-2 border-sidebar-border">
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            {/* Trip title - only show when viewing a trip */}
            {trip && (
              <div className="bg-sidebar/95 backdrop-blur-sm border-2 border-sidebar-border rounded-full px-4 py-2 shadow-lg max-w-[calc(100%-120px)]">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {trip.title}
                </p>
              </div>
            )}
          </div>
          
          {/* Main Stage with top padding for menu bar */}
          <main className="flex-1 flex flex-col overflow-hidden paper-texture pt-16">
            {children}
          </main>
        </>
      ) : (
        <>
          {/* Desktop: Fixed sidebar */}
          <Sidebar />
          
          {/* Main Stage - paper texture background */}
          <main className="flex-1 flex flex-col overflow-hidden paper-texture">
            {children}
          </main>
        </>
      )}
    </div>
  );
}
