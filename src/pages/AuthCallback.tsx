import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check for errors in the URL (e.g., bad_oauth_state)
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        const errorCode = params.get('error_code');

        if (error) {
            console.error("[AuthCallback] OAuth Error:", error, errorDescription);
            // Show toast (assuming Toaster is globally available, or use alert/console if not)
            // Ideally import toast from sonner
            import('sonner').then(({ toast }) => {
                toast.error(`Authentication Failed: ${errorDescription || error}`);
            });

            // Redirect back to auth after a short delay to let user see error
            const timer = setTimeout(() => navigate('/auth'), 4000);
            return () => clearTimeout(timer);
        }

        if (user) {
            navigate('/dashboard');
        } else {
            // Fallback: If no user after a timeout, go to auth
            const timer = setTimeout(() => {
                navigate('/auth');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Completing sign in...</p>
        </div>
    );
}
