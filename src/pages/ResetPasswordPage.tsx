import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase appends #access_token=...&type=recovery to the URL on success,
    // or ?error=... / #error=... if the link is expired/invalid.
    const hash = window.location.hash;
    const search = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

    if (hash.includes('type=recovery')) {
      setIsRecoveryMode(true);
    }

    // Surface Supabase's error params (e.g. otp_expired) so the user isn't
    // stuck staring at "Checking your reset link…" forever.
    if (search.get('error') || hashParams.get('error')) {
      setLinkExpired(true);
    }

    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    // Fallback: if neither the hash token nor a PASSWORD_RECOVERY event
    // arrives within a few seconds, show a helpful error rather than a
    // perpetual loading state.
    const timeout = window.setTimeout(() => setLinkExpired(true), 5000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: 'Reset failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password updated',
          description: 'Your password has been reset successfully.',
        });
        navigate('/', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRecoveryMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="font-serif text-4xl text-foreground mb-4">Le Voyage</h1>
          {linkExpired ? (
            <>
              <p className="text-muted-foreground mb-2">
                This reset link is invalid or has expired.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Request a new link from the sign-in page — each link can only be used once.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="text-primary hover:underline"
              >
                Return to sign in
              </button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">Checking your reset link…</p>
              <p className="text-sm text-muted-foreground">
                If nothing happens, the link may be expired or invalid.{' '}
                <button
                  onClick={() => navigate('/auth')}
                  className="text-primary hover:underline"
                >
                  Return to sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-foreground mb-2">Le Voyage</h1>
          <p className="text-muted-foreground text-sm">Set your new password</p>
        </div>

        <div className="content-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-nouveau h-12 text-base"
            >
              {isSubmitting ? 'Updating…' : 'Reset Password'}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-muted-foreground text-xs">
          ❦ Crafted with care in the spirit of Paris ❦
        </div>
      </div>
    </div>
  );
}
