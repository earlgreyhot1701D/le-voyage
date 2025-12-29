import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateItineraryItem } from '@/hooks/useItinerary';
import type { Tables } from '@/integrations/supabase/types';

type TripDay = Tables<'trip_days'>;
type Place = Tables<'places'>;

interface AddToItineraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripDays: TripDay[];
  place?: Place | null;
}

export function AddToItineraryModal({ 
  open, 
  onOpenChange, 
  tripDays, 
  place 
}: AddToItineraryModalProps) {
  const [selectedDayId, setSelectedDayId] = useState<string>(tripDays[0]?.id || '');
  const [time, setTime] = useState('10:00');
  const [title, setTitle] = useState(place?.name || '');
  const [notes, setNotes] = useState('');
  
  const createItem = useCreateItineraryItem(selectedDayId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDayId || !title.trim()) return;

    try {
      await createItem.mutateAsync({
        trip_day_id: selectedDayId,
        place_id: place?.id || null,
        title: title.trim(),
        time,
        description: place?.neighborhood_name || null,
        notes: notes.trim() || null,
        order_index: 0, // Will be at the end
      });
      
      onOpenChange(false);
      // Reset form
      setTime('10:00');
      setTitle('');
      setNotes('');
    } catch (error) {
      console.error('Failed to add to itinerary:', error);
    }
  };

  // Update title when place changes
  useState(() => {
    if (place?.name) {
      setTitle(place.name);
    }
  });

  const formatDayLabel = (day: TripDay) => {
    const date = new Date(day.date);
    return `Day ${day.day_number} - ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add to Itinerary</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Day selector */}
          <div className="space-y-2">
            <Label>Which day?</Label>
            {tripDays.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No days available. Add trip dates first to generate days.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tripDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedDayId === day.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {formatDayLabel(day)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Breakfast at Café de Flore"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes or reminders..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedDayId || !title.trim() || createItem.isPending}
            >
              {createItem.isPending ? 'Adding...' : 'Add to Day'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddToItineraryModal;
