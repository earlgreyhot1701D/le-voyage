import { ReactNode } from 'react';

interface NavSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function NavSection({ title, children, className = '' }: NavSectionProps) {
  return (
    <div className={`nav-group mb-10 ${className}`}>
      <span className="nav-section-title">{title}</span>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
