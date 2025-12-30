import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile: Sheet-based sidebar */}
      {isMobile ? (
        <>
          {/* Floating menu button */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button 
                className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-sidebar border-2 border-sidebar-border shadow-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar/90 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r-2 border-sidebar-border">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          
          {/* Main Stage with top padding for menu button */}
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
