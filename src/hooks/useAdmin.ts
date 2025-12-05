import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { Resource } from './useResources';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'superadmin']);

      if (!error && data && data.length > 0) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}

export function usePendingResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResources(data as Resource[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return { resources, loading, refetch: fetchPending };
}

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalResources: 0,
    pendingResources: 0,
    totalUsers: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Get total resources
      const { count: totalResources } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get pending resources
      const { count: pendingResources } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total downloads
      const { data: downloadData } = await supabase
        .from('resources')
        .select('downloads')
        .eq('status', 'approved');

      const totalDownloads = downloadData?.reduce((sum, r) => sum + (r.downloads || 0), 0) || 0;

      setStats({
        totalResources: totalResources || 0,
        pendingResources: pendingResources || 0,
        totalUsers: totalUsers || 0,
        totalDownloads
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

export async function approveResource(resourceId: string, uploaderId: string | null) {
  const { error } = await supabase
    .from('resources')
    .update({ status: 'approved' })
    .eq('id', resourceId);

  if (!error && uploaderId) {
    // Notify the uploader
    await supabase.from('notifications').insert({
      user_id: uploaderId,
      title: 'Resource Approved',
      message: 'Your resource has been approved and is now visible to other students!'
    });
  }

  return { error };
}

export async function rejectResource(resourceId: string, uploaderId: string | null, comment: string) {
  const { error } = await supabase
    .from('resources')
    .update({ status: 'rejected', admin_comments: comment })
    .eq('id', resourceId);

  if (!error && uploaderId) {
    // Notify the uploader
    await supabase.from('notifications').insert({
      user_id: uploaderId,
      title: 'Resource Rejected',
      message: `Your resource was not approved. Reason: ${comment}`
    });
  }

  return { error };
}
