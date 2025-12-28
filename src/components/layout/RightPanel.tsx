import { ReactNode } from 'react';

interface RightPanelProps {
  children: ReactNode;
  title?: string;
}

export function RightPanel({ children, title }: RightPanelProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 h-full animate-fade-in">
      {title && (
        <h2 className="text-lg font-serif font-semibold text-card-foreground mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}