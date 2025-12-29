import { Sparkles, X } from 'lucide-react';

interface InsightCardProps {
  title: string;
  content: string;
  actionLabel?: string | null;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function InsightCard({ 
  title, 
  content, 
  actionLabel, 
  onAction,
  onDismiss 
}: InsightCardProps) {
  return (
    <div className="gem-card relative group">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/20"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      
      <div className="flex items-start gap-2 mb-2">
        <Sparkles className="h-4 w-4 mt-1 shrink-0" style={{ color: 'hsl(var(--amber-glow))' }} />
        <h5 className="font-serif text-lg" style={{ color: 'hsl(var(--amber-glow))' }}>
          {title}
        </h5>
      </div>
      
      <p className="text-[13px] leading-relaxed opacity-90 ml-6">
        {content}
      </p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="btn-nouveau mt-3 ml-6"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
