import { useState, useEffect } from 'react';
import { useUpdateTrip } from '@/hooks/useTrips';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Tables } from '@/integrations/supabase/types';

type Trip = Tables<'trips'>;
type TripStatus = Trip['status'];

interface EditTripModalProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTripModal({ trip, open, onOpenChange }: EditTripModalProps) {
  const updateTrip = useUpdateTrip();
  
  const [title, setTitle] = useState(trip.title);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState<Date | undefined>(
    trip.start_date ? new Date(trip.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    trip.end_date ? new Date(trip.end_date) : undefined
  );
  const [status, setStatus] = useState<TripStatus>(trip.status);

  // Reset form when trip changes
  useEffect(() => {
    setTitle(trip.title);
    setDestination(trip.destination);
    setStartDate(trip.start_date ? new Date(trip.start_date) : undefined);
    setEndDate(trip.end_date ? new Date(trip.end_date) : undefined);
    setStatus(trip.status);
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !destination.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and destination',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateTrip.mutateAsync({
        tripId: trip.id,
        updates: {
          title: title.trim(),
          destination: destination.trim(),
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          status,
        },
      });
      
      toast({
        title: 'Trip updated',
        description: 'Your changes have been saved.',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error updating trip',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Trip</DialogTitle>
          <DialogDescription>
            Update your trip details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Trip Title</Label>
            <Input
              id="edit-title"
              placeholder="Paris · Spring 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-destination">Destination</Label>
            <Input
              id="edit-destination"
              placeholder="Paris, France"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TripStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTrip.isPending}>
              {updateTrip.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
