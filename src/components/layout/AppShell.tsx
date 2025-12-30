import { ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { useTrip } from '@/hooks/useTrips';
import { UserMenu } from '@/components/auth/UserMenu';

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
          {/* Slim fixed header bar */}
          <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border flex items-center px-3 gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button 
                  className="w-9 h-9 rounded-lg bg-sidebar-accent/50 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r-2 border-sidebar-border">
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            {/* Trip title */}
            <span className="font-semibold text-sm text-sidebar-foreground truncate flex-1">
              {trip?.title || 'Le Voyage'}
            </span>
            
            <UserMenu />
          </header>
          
          {/* Main Stage with reduced top padding */}
          <main className="flex-1 flex flex-col overflow-hidden paper-texture pt-12">
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
