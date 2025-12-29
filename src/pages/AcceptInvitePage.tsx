import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInvitationByToken, useAcceptInvitation } from '@/hooks/useCollaborators';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, MapPin } from 'lucide-react';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const { data: invitation, isLoading: inviteLoading, error: inviteError } = useInvitationByToken(token);
  const acceptInvitation = useAcceptInvitation();
  
  const [accepted, setAccepted] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      // Save the invite URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', `/invite/${token}`);
      navigate('/auth');
    }
  }, [authLoading, user, token, navigate]);

  const handleAccept = async () => {
    if (!token) return;
    
    try {
      await acceptInvitation.mutateAsync(token);
      setAccepted(true);
      toast({
        title: 'Invitation accepted!',
        description: 'You now have access to this trip.',
      });
      
      // Get the trip ID from the invitation and redirect
      if (invitation?.trip_id) {
        setTimeout(() => {
          navigate(`/trip/${invitation.trip_id}`);
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      const isEmailMismatch = errorMessage.includes('different email address');
      
      toast({
        title: isEmailMismatch ? 'Wrong account' : 'Failed to accept invitation',
        description: isEmailMismatch 
          ? 'This invitation was sent to a different email. Please log in with the correct account.' 
          : errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (authLoading || inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (inviteError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>Welcome to the trip!</CardTitle>
            <CardDescription>
              Redirecting you to the trip...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">You're Invited!</CardTitle>
          <CardDescription>
            You've been invited to collaborate on a trip as a <strong>{invitation.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Invitation expires on:</p>
            <p className="font-medium text-foreground">
              {new Date(invitation.expires_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleAccept}
            disabled={acceptInvitation.isPending}
          >
            {acceptInvitation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Decline
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
