-- Create flashcard_decks table
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Policies for Decks
CREATE POLICY "Users can view public decks or own decks" ON public.flashcard_decks
  FOR SELECT USING (is_public OR auth.uid() = user_id);

CREATE POLICY "Users can create own decks" ON public.flashcard_decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON public.flashcard_decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON public.flashcard_decks
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for Cards
-- Users can view cards if they can view the deck.
-- This requires a join or a subquery which can be expensive in RLS, but for simple app is fine.
-- Alternatively, we can rely on application logic + checking deck ownership for write.
-- Let's try to be secure.

CREATE POLICY "Users can view cards of accessible decks" ON public.flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks
      WHERE public.flashcard_decks.id = flashcards.deck_id
      AND (public.flashcard_decks.is_public OR public.flashcard_decks.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage cards in own decks" ON public.flashcards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks
      WHERE public.flashcard_decks.id = flashcards.deck_id
      AND public.flashcard_decks.user_id = auth.uid()
    )
  );
