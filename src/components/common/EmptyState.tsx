interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '✦', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-4xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}