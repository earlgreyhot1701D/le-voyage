import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required').optional(),
});

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, resetPasswordForEmail, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Check for invite redirect first
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl, { replace: true });
      } else {
        // Check if there's a location state from ProtectedRoute
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, location.state]);

  const validateForm = () => {
    try {
      if (mode === 'forgotPassword') {
        z.string().email('Please enter a valid email address').parse(email);
        setErrors({});
        return true;
      }
      const data: Record<string, string> = { email, password };
      if (mode === 'signUp') {
        data.displayName = displayName;
      }
      authSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'forgotPassword') {
        const { error } = await resetPasswordForEmail(email);
        if (error) {
          toast({
            title: 'Reset failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check your email',
            description: 'We sent you a password reset link. Please check your inbox.',
          });
          setMode('signIn');
        }
        return;
      }

      if (mode === 'signUp') {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Check your email',
            description: 'We sent you a confirmation link. Click it, then sign in below.',
          });
          // Swap to the sign-in form so the user has a clear next step after
          // confirming their email, rather than a stale sign-up form.
          setPassword('');
          setDisplayName('');
          setMode('signIn');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Invalid credentials',
              description: 'Please check your email and password.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const subtitle = mode === 'signUp' 
    ? 'Create your account' 
    : mode === 'forgotPassword' 
      ? 'Reset your password' 
      : 'Welcome back, traveler';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-foreground mb-2">Le Voyage</h1>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>

        {/* Auth Card */}
        <div className="content-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signUp' && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-xl"
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive">{errors.displayName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {mode !== 'forgotPassword' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
            )}

            {mode === 'signIn' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgotPassword'); setErrors({}); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-nouveau h-12 text-base"
            >
              {isSubmitting 
                ? 'Please wait...' 
                : mode === 'signUp' 
                  ? 'Create Account' 
                  : mode === 'forgotPassword' 
                    ? 'Send Reset Link' 
                    : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'forgotPassword' ? (
              <button
                type="button"
                onClick={() => { setMode('signIn'); setErrors({}); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signUp' ? 'signIn' : 'signUp');
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === 'signUp' 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </div>

        {/* Decorative element */}
        <div className="mt-8 text-center text-muted-foreground text-xs">
          ❦ Crafted with care in the spirit of Paris ❦
        </div>
      </div>
    </div>
  );
}
