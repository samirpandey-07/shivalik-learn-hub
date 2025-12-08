import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
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
