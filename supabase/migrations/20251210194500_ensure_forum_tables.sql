-- Ensure Forum Tables & Functions Exist
-- This migration is idempotent (safe to run multiple times)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.forum_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  college_id UUID REFERENCES public.colleges(id),
  course_id UUID REFERENCES public.courses(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.forum_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.forum_questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.forum_answers(id) ON DELETE CASCADE,
  vote_type INTEGER DEFAULT 1, -- 1 like, -1 dislike
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT vote_target_check CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL)
  ),
  UNIQUE(user_id, question_id, answer_id)
);

-- 2. RLS Policies (Drop and Recreate to ensure correct definition)

-- Questions
ALTER TABLE public.forum_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view questions" ON public.forum_questions;
CREATE POLICY "Anyone can view questions" ON public.forum_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create questions" ON public.forum_questions;
CREATE POLICY "Authenticated users can create questions" ON public.forum_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own questions" ON public.forum_questions;
CREATE POLICY "Users can update own questions" ON public.forum_questions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete/edit questions" ON public.forum_questions;
CREATE POLICY "Admins can delete/edit questions" ON public.forum_questions FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and (role = 'admin' or role = 'superadmin'))
);

-- Answers
ALTER TABLE public.forum_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view answers" ON public.forum_answers;
CREATE POLICY "Anyone can view answers" ON public.forum_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create answers" ON public.forum_answers;
CREATE POLICY "Authenticated users can create answers" ON public.forum_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own answers" ON public.forum_answers;
CREATE POLICY "Users can update own answers" ON public.forum_answers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete/edit answers" ON public.forum_answers;
CREATE POLICY "Admins can delete/edit answers" ON public.forum_answers FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and (role = 'admin' or role = 'superadmin'))
);

-- Votes
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view votes" ON public.forum_votes;
CREATE POLICY "Anyone can view votes" ON public.forum_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.forum_votes;
CREATE POLICY "Authenticated users can vote" ON public.forum_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change their vote" ON public.forum_votes;
CREATE POLICY "Users can change their vote" ON public.forum_votes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their vote" ON public.forum_votes;
CREATE POLICY "Users can remove their vote" ON public.forum_votes FOR DELETE USING (auth.uid() = user_id);


-- 3. Functions

-- RPC: Toggle Poll Vote (Used for Forum Questions too)
-- Handles toggling a vote on a question (creates or deletes)
CREATE OR REPLACE FUNCTION toggle_poll_vote(p_question_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_existing_vote UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if vote exists
  SELECT id INTO v_existing_vote FROM public.forum_votes
  WHERE user_id = v_user_id AND question_id = p_question_id;

  IF v_existing_vote IS NOT NULL THEN
    -- Remove vote
    DELETE FROM public.forum_votes WHERE id = v_existing_vote;
    -- Decrement count
    UPDATE public.forum_questions SET upvotes = upvotes - 1 WHERE id = p_question_id;
    RETURN false; -- Vote removed
  ELSE
    -- Add vote
    INSERT INTO public.forum_votes (user_id, question_id, vote_type)
    VALUES (v_user_id, p_question_id, 1);
    -- Increment count
    UPDATE public.forum_questions SET upvotes = upvotes + 1 WHERE id = p_question_id;
    RETURN true; -- Vote added
  END IF;
END;
$$;
