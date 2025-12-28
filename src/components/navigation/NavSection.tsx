import { ReactNode } from 'react';

interface NavSectionProps {
  title: string;
  children: ReactNode;
}

export function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="mb-2">
      <h3 className="nav-section-title">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}