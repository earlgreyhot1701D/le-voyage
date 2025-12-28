import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar - 280px with amber border */}
      <Sidebar />
      
      {/* Main Stage - paper texture background */}
      <main className="flex-1 flex flex-col overflow-hidden paper-texture">
        {children}
      </main>
    </div>
  );
}
