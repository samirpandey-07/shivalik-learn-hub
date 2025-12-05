import { supabase } from '@/lib/supabase/client';

export async function getPendingResources() {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function approveResource(resourceId: string, adminId: string) {
  // adminId optional logic if needed for audit logs
  const { error } = await supabase
    .from("resources")
    .update({ status: "approved" })
    .eq("id", resourceId);

  return { error };
}

export async function rejectResource(resourceId: string, adminId: string, comment: string) {
  const { error } = await supabase
    .from("resources")
    .update({
      status: "rejected",
      admin_comments: comment
    })
    .eq("id", resourceId);

  return { error };
}
