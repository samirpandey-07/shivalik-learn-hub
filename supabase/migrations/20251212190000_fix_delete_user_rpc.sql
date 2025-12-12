-- Migration to fix delete_user_account RPC
-- Ensures both Profile and Auth User are deleted explicitly to prevent "Zombie Users"

CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- 1. Check Admin Permissions
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users.';
  END IF;

  -- 2. Prevent Self-Deletion
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;

  -- 3. Delete from Dependent Tables (Hard Delete)
  
  -- Clear Study Room Data (Critical Fix)
  -- The error "room_messages_user_id_fkey" indicates we must delete messages first
  DELETE FROM public.room_messages WHERE user_id = target_user_id;
  -- Also delete rooms created by this user (which will cascade delete messages in them too, but good to be thorough)
  DELETE FROM public.study_rooms WHERE created_by = target_user_id;

  -- Clear Community/Forum Data
  -- Check if tables exist to avoid migration errors if feature not fully deployed
  BEGIN
    DELETE FROM public.forum_posts WHERE author_id = target_user_id;
    DELETE FROM public.forum_comments WHERE author_id = target_user_id;
    DELETE FROM public.community_members WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Clear user's resources (and let their own cascades handle sub-data if any)
  DELETE FROM public.resources WHERE uploader_id = target_user_id;
  
  -- Clear saved resources
  DELETE FROM public.saved_resources WHERE user_id = target_user_id;

  -- Clear reviews/comments (if table exists, handle gracefully)
  BEGIN
    DELETE FROM public.reviews WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL; -- Ignore if table doesn't exist
  END;

  -- Clear notifications
  DELETE FROM public.notifications WHERE user_id = target_user_id;

  -- Clear badges (though cascade usually handles this)
  DELETE FROM public.user_badges WHERE user_id = target_user_id;

  -- 4. Delete from Profiles
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 5. Delete from Auth Users
  DELETE FROM auth.users WHERE id = target_user_id;

END;
$$;

-- Grant Permission to Authenticated Users (Critical for Frontend access)
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO service_role;
