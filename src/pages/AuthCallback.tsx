import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    // 1. If user is already resolved in Auth context, redirect to dashboard immediately
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    const code = params.get('code');

    // 2. Check for OAuth Error from provider or Supabase
    if (error) {
      console.error('[AuthCallback] OAuth Error encountered:', error, errorDescription);
      toast.error(`Authentication Failed: ${errorDescription || error}`);
      const timer = setTimeout(() => navigate('/auth', { replace: true }), 3000);
      return () => clearTimeout(timer);
    }

    // 3. Explicitly exchange PKCE code for session if present
    if (code && !exchangeAttempted.current) {
      exchangeAttempted.current = true;
      console.log('[AuthCallback] Exchanging PKCE authorization code for session...');
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error: exchangeError }) => {
          if (exchangeError) {
            console.error('[AuthCallback] Code exchange failed:', exchangeError);
            toast.error(`Sign in error: ${exchangeError.message}`);
            navigate('/auth', { replace: true });
          } else if (data.session) {
            console.log('[AuthCallback] Code exchange succeeded, redirecting to /dashboard');
            navigate('/dashboard', { replace: true });
          }
        })
        .catch((err) => {
          console.error('[AuthCallback] Code exchange exception:', err);
          navigate('/auth', { replace: true });
        });
      return;
    }

    // 4. Also listen to onAuthStateChange for SIGNED_IN event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AuthCallback] onAuthStateChange SIGNED_IN detected, navigating to /dashboard');
        navigate('/dashboard', { replace: true });
      }
    });

    // 5. Fallback check if no code in query params (e.g. implicit hash or existing session)
    if (!code && !authLoading) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          navigate('/dashboard', { replace: true });
        } else {
          // Allow small grace period for storage hydration before failing to /auth
          const timer = setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 2000);
          return () => clearTimeout(timer);
        }
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm font-medium">Completing authentication...</p>
    </div>
  );
}
