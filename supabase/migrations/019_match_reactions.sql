-- Migration 019: Match reactions (emoji responses per match)

CREATE TABLE IF NOT EXISTS public.match_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('fire', 'clap', 'skull', 'clown')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_id, emoji)
);

CREATE INDEX idx_match_reactions_match ON public.match_reactions(match_id);
CREATE INDEX idx_match_reactions_user ON public.match_reactions(user_id);

ALTER TABLE public.match_reactions ENABLE ROW LEVEL SECURITY;

-- Group members can view reactions on matches they can see
CREATE POLICY "Group members can view match reactions"
  ON public.match_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.competitions c ON c.id = m.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE m.id = match_reactions.match_id
      AND gm.user_id = auth.uid()
    )
  );

-- Members can insert their own reactions
CREATE POLICY "Members can add reactions"
  ON public.match_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.competitions c ON c.id = m.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE m.id = match_reactions.match_id
      AND gm.user_id = auth.uid()
    )
  );

-- Members can remove their own reactions
CREATE POLICY "Members can remove own reactions"
  ON public.match_reactions FOR DELETE
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
