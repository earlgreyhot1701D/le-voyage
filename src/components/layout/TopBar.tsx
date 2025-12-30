import { Pencil, Users } from 'lucide-react';
import { fixtureTrip } from '@/data/fixtures';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  date?: string;
  canEdit?: boolean;
  onEditClick?: () => void;
  onCollaboratorsClick?: () => void;
}

// Default to fixture trip date if not provided
const defaultDate = fixtureTrip.start_date 
  ? new Date(fixtureTrip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  : 'April 2025';

export function TopBar({ 
  date = defaultDate, 
  canEdit = false, 
  onEditClick, 
  onCollaboratorsClick 
}: TopBarProps) {
  return (
    <div className="px-10 py-8 flex justify-end items-center">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold mr-2">{date}</span>
        
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
