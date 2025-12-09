-- Create forum_questions table
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

-- Create forum_answers table
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

-- Create forum_votes table to track user votes
CREATE TABLE IF NOT EXISTS public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.forum_questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.forum_answers(id) ON DELETE CASCADE,
  vote_type INTEGER DEFAULT 1, -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT vote_target_check CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL)
  ),
  UNIQUE(user_id, question_id, answer_id) -- Prevent double voting on same item
);

-- RLS Policies

-- Questions
ALTER TABLE public.forum_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view questions" ON public.forum_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON public.forum_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.forum_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete/edit questions" ON public.forum_questions FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Answers
ALTER TABLE public.forum_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view answers" ON public.forum_answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create answers" ON public.forum_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.forum_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete/edit answers" ON public.forum_answers FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Votes
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" ON public.forum_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.forum_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON public.forum_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote" ON public.forum_votes FOR DELETE USING (auth.uid() = user_id);

-- Optional: Triggers to update upvotes count on Questions/Answers
-- For MVP, we might calculate on read or update manually. 
-- Adding a simple function to update counts would be better performance-wise but complex to get right with concurrent updates. 
-- Will stick to client-side optimistic UI + server recalculation or just relying on `count` query for now? 
-- The table has `upvotes` column. Let's keep it simple and increment it via RPC or just update via client for now (secured by RLS? No, update policy restricts to owner).
-- Actually, a common pattern is to just count the votes table. But we added an `upvotes` column for caching.
-- Let's Creating a Trigger to auto-update the counts.

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.question_id IS NOT NULL) THEN
      UPDATE public.forum_questions SET upvotes = upvotes + NEW.vote_type WHERE id = NEW.question_id;
    ELSIF (NEW.answer_id IS NOT NULL) THEN
      UPDATE public.forum_answers SET upvotes = upvotes + NEW.vote_type WHERE id = NEW.answer_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.question_id IS NOT NULL) THEN
      UPDATE public.forum_questions SET upvotes = upvotes - OLD.vote_type WHERE id = OLD.question_id;
    ELSIF (OLD.answer_id IS NOT NULL) THEN
      UPDATE public.forum_answers SET upvotes = upvotes - OLD.vote_type WHERE id = OLD.answer_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
AFTER INSERT OR DELETE ON public.forum_votes
FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();
