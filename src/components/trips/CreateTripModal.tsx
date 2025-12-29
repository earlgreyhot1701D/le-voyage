import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '@/hooks/useTrips';
import { toast } from '@/hooks/use-toast';
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

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTripModal({ open, onOpenChange }: CreateTripModalProps) {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      const trip = await createTrip.mutateAsync({
        title: title.trim(),
        destination: destination.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        status: 'planning',
        cover_image_url: null,
      });
      
      toast({
        title: 'Trip created!',
        description: `${trip.title} has been created.`,
      });
      
      // Reset form and close
      setTitle('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      onOpenChange(false);
      
      // Navigate to the new trip
      navigate(`/trip/${trip.id}`);
    } catch (error) {
      toast({
        title: 'Error creating trip',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Create New Trip</DialogTitle>
          <DialogDescription>
            Plan your next adventure. Add details to get started.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Trip Title</Label>
            <Input
              id="title"
              placeholder="Paris · Spring 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="Paris, France"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
            <Button type="submit" disabled={createTrip.isPending}>
              {createTrip.isPending ? 'Creating...' : 'Create Trip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
