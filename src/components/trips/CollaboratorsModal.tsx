import { useState } from 'react';
import { Users, Mail, X, Crown, Pencil, Eye, Copy, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTripPermissions } from '@/hooks/useTripPermissions';
import {
  useCollaborators,
  useInvitations,
  useInviteCollaborator,
  useRemoveInvitation,
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
} from '@/hooks/useCollaborators';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CollaboratorsModalProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollaboratorsModal({ tripId, open, onOpenChange }: CollaboratorsModalProps) {
  const { user } = useAuth();
  const { isOwner, isLoading: permissionsLoading } = useTripPermissions(tripId);
  
  const { data: collaborators = [], isLoading: collabLoading } = useCollaborators(tripId);
  // Only fetch invitations when we know the user is the owner (prevents 403 errors)
  const { data: invitations = [], isLoading: inviteLoading } = useInvitations(tripId, isOwner && !permissionsLoading);
  
  const inviteCollaborator = useInviteCollaborator();
  const removeInvitation = useRemoveInvitation();
  const removeCollaborator = useRemoveCollaborator();
  const updateRole = useUpdateCollaboratorRole();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      await inviteCollaborator.mutateAsync({ tripId, email: email.trim(), role });
      toast({
        title: 'Invitation sent',
        description: `Invited ${email} as ${role}`,
      });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Failed to invite',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    toast({ title: 'Invite link copied!' });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRemoveInvitation = async (invitationId: string) => {
    try {
      await removeInvitation.mutateAsync({ invitationId, tripId });
      toast({ title: 'Invitation cancelled' });
    } catch {
      toast({ title: 'Failed to remove invitation', variant: 'destructive' });
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await removeCollaborator.mutateAsync({ tripId, userId });
      toast({ title: 'Collaborator removed' });
    } catch {
      toast({ title: 'Failed to remove collaborator', variant: 'destructive' });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'editor' | 'viewer') => {
    try {
      await updateRole.mutateAsync({ tripId, userId, role: newRole });
      toast({ title: 'Role updated' });
    } catch {
      toast({ title: 'Failed to update role', variant: 'destructive' });
    }
  };

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'editor': return <Pencil className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (roleValue: string) => {
    switch (roleValue) {
      case 'owner': return 'default';
      case 'editor': return 'secondary';
      default: return 'outline';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborators
          </DialogTitle>
          <DialogDescription>
            Manage who has access to this trip
          </DialogDescription>
        </DialogHeader>

        {/* Invite Form - Only for owners */}
        {isOwner && (
          <form onSubmit={handleInvite} className="border-b border-border pb-4 mb-4">
            <Label className="text-sm font-medium mb-2 block">Invite by email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={role} onValueChange={(v) => setRole(v as 'viewer' | 'editor')}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={inviteCollaborator.isPending}>
                {inviteCollaborator.isPending ? '...' : 'Invite'}
              </Button>
            </div>
          </form>
        )}

        {/* Current Collaborators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Team Members</h4>
          {collabLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div 
                  key={collab.user_id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collab.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(collab.profiles?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {collab.profiles?.display_name || 'Unknown'}
                        {collab.user_id === user?.id && (
                          <span className="text-muted-foreground ml-1">(you)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && collab.role !== 'owner' ? (
                      <>
                        <Select 
                          value={collab.role} 
                          onValueChange={(v) => handleRoleChange(collab.user_id, v as 'editor' | 'viewer')}
                        >
                          <SelectTrigger className="w-24 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveCollaborator(collab.user_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                        {getRoleIcon(collab.role)}
                        {collab.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        {isOwner && invitations.length > 0 && (
          <div className="space-y-3 mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground">Pending Invitations</h4>
            {inviteLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-2">
                {invitations.map((invite) => (
                  <div 
                    key={invite.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited as {invite.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyInviteLink(invite.token)}
                        title="Copy invite link"
                      >
                        {copiedToken === invite.token ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveInvitation(invite.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
