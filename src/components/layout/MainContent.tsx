import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function MainContent({ children, title, subtitle }: MainContentProps) {
  return (
    <div className="animate-fade-in">
      {(title || subtitle) && (
        <header className="mb-8">
          {title && (
            <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}