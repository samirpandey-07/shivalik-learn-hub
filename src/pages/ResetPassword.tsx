import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (handled by AuthProvider automatically processing the hash/code)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // If session exists, we are good
            if (session) return;

            // If no session, check for hash fragment (implicit flow)
            const hash = window.location.hash;
            if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1)); // remove #
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (error) {
                        toast.error('Invalid or expired reset link');
                    }
                    return;
                }
            }

            // Fallback: Listen for auth state change
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    // User is signed in via recovery link
                }
            });
            return () => subscription.unsubscribe();
        };
        checkSession();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success('Password updated successfully!');

            // Sign out the user so they have to log in with the new password
            await supabase.auth.signOut();

            navigate('/auth'); // Redirect to login
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Set New Password</h1>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all transform hover:scale-[1.02]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </Button>

                    <div className="text-center mt-4">
                        <Link to="/auth" className="text-sm text-slate-400 hover:text-white transition-colors">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
