import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar - 280px */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 gap-dashboard p-content overflow-hidden">
        {/* Center Panel - Flexible */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
        
        {/* Right Panel - 350px */}
        {rightPanel && (
          <aside className="w-right-panel flex-shrink-0 overflow-y-auto scrollbar-thin">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}