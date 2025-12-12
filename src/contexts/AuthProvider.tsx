import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [roles, setRoles] = useState<string[]>([]); // Roles state
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // fetchProfile and createProfile are intentionally defined here and use the AuthContext
  const fetchProfile = async (userId: string) => {
    try {
      // 1. Fetch Profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // If no profile (error 406/PGRST116), try creating one
      if (!data) {
        console.warn("[AuthProvider] Profile missing for user, creating one...", userId);
        await createProfile(userId);
        return;
      }

      if (data) {
        setProfile(data);
        const profileData = data as any;

        // Check for ban status
        if (profileData.is_banned) {
          toast.error("Account Suspended", {
            description: "Your account has been banned due to violations of our terms."
          });
          await signOut();
          return;
        }

        // Cast to any to access the new 'role' column until types are regenerated
        if (profileData.role) {
          setRoles([profileData.role]);
        } else {
          setRoles(['student']); // Default to student
        }
      }

    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  async function createProfile(userId: string) {
    try {
      // Create user profile only if the user actually exists in Auth
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.warn("[AuthProvider] User not found in Auth (likely deleted). Signing out instead of creating profile.");
        await signOut();
        window.location.href = '/'; // Force redirect
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userData.user.email,
            full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("[AuthProvider] Failed to create profile:", error);
        // If insert failed (e.g. FK violation because Auth user is gone), ensure we sign out
        // Check filtering for specific Postgres error codes if needed, but safe to assume trouble for now
        if (error.code === '23503') { // Foreign key violation
          console.warn("[AuthProvider] Foreign key violation - User likely deleted. Signing out.");
          await signOut();
          window.location.href = '/';
          return;
        }
        throw error;
      };
      setProfile(data);
      setRoles([]); // New users have no roles by default
    } catch (err) {
      console.error('Error creating profile:', err);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function handleSession(session: Session | null) {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setRoles([]);
        setIsLoading(false);
      }
    }

    // Initialize Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    }).catch((err) => {
      console.error("[AuthProvider] getSession failed:", err);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Avoid redundant updates if session ID hasn't changed, but careful with profile updates
      handleSession(session);

      if (_event === 'SIGNED_OUT') toast.info('Signed out successfully');
    });

    // Realtime Profile Updates
    const channel = supabase.channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        async (payload) => {
          // If the change affects the current user
          const currentUser = (await supabase.auth.getSession()).data.session?.user;

          if (!currentUser) return;

          // Handle DELETE event - User profile was deleted
          if (payload.eventType === 'DELETE' && payload.old && (payload.old as any).id === currentUser.id) {
            console.warn("[AuthProvider] Profile deleted remotely. Signing out.");
            toast.error("Account Deleted", { description: "Your account has been removed by an admin." });
            await signOut();
            // Force redirect to home/auth by reloading or navigation if signOut doesn't trigger it fast enough
            window.location.href = '/';
            return;
          }

          // Handle UPDATE/INSERT events
          if (payload.new && (payload.new as any).id === currentUser.id) {
            console.log("[AuthProvider] Realtime profile update received:", payload.new);

            // Check if user was just banned
            if ((payload.new as any).is_banned) {
              toast.error("Account Suspended", {
                description: "Your account has been banned."
              });
              await signOut();
              return;
            }

            setProfile(payload.new);

            // Update roles if changed
            const newProfile = payload.new as any;
            if (newProfile.role) {
              setRoles([newProfile.role]);
            } else {
              setRoles(['student']);
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      if (!error && data.user) {

      }
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("[AuthProvider] Initiating Google Sign-In with redirect:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setRoles([]);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const updateProfile = async (data: any) => {
    if (!user) throw new Error('No user logged in');
    try {
      const { error } = await supabase.from('profiles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (error) throw error;

      // Fix: If prev is null, valid data should still be set
      setProfile((prev: any) => {
        if (prev) return { ...prev, ...data };
        return { id: user.id, ...data };
      });

      // Double check by fetching fresh
      await fetchProfile(user.id);

    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = { user, profile, roles, isLoading, signIn, signUp, signInWithGoogle, signOut, updateProfile, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
