import { Pencil, Users } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

interface TopBarProps {
  trip?: Tables<'trips'> | null;
  currentView?: string;
  canEdit?: boolean;
  onEditClick?: () => void;
  onCollaboratorsClick?: () => void;
}

export function TopBar({ 
  trip,
  currentView,
  canEdit = false, 
  onEditClick, 
  onCollaboratorsClick 
}: TopBarProps) {
  const dateDisplay = trip?.start_date
    ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="px-6 py-4 flex justify-between items-center">
      {/* Left: Trip context */}
      <div className="flex items-center gap-2">
        {trip && (
          <>
            <h1 className="font-serif text-lg font-semibold">{trip.title}</h1>
            {currentView && (
              <>
                <span className="text-muted-foreground">›</span>
                <span className="text-sm text-muted-foreground">{currentView}</span>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {dateDisplay && (
          <span className="text-sm font-medium text-muted-foreground mr-1">{dateDisplay}</span>
        )}
        
        {canEdit && onCollaboratorsClick && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCollaboratorsClick}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Collaborators</span>
          </Button>
        )}
        
        {canEdit && onEditClick && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEditClick}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Trip</span>
          </Button>
        )}
        
        <UserMenu />
      </div>
    </div>
  );
}
