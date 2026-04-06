-- ============================================================
-- Migration 017: Groups & League / Season Competition Layer
-- ============================================================

-- ── Groups ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ── Competitions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('ryder_cup', 'money', 'individual')),
  season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams (for Ryder Cup format)
CREATE TABLE IF NOT EXISTS public.competition_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#70798C'
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.competition_teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(team_id, user_id)
);

-- ── Matches ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  played_on DATE NOT NULL,
  course TEXT,
  format TEXT NOT NULL DEFAULT '1v1' CHECK (format IN ('1v1', '2v2', 'scramble', 'stroke_play')),
  status TEXT NOT NULL DEFAULT 'complete' CHECK (status IN ('pending', 'complete')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match participants (sides A and B)
CREATE TABLE IF NOT EXISTS public.match_sides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('a', 'b')),
  team_id UUID REFERENCES public.competition_teams(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
  -- Either team_id or user_id is populated depending on format
);

CREATE TABLE IF NOT EXISTS public.match_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL UNIQUE,
  winner TEXT CHECK (winner IN ('a', 'b', 'tie')),
  points_a DECIMAL(5,1) DEFAULT 0,
  points_b DECIMAL(5,1) DEFAULT 0,
  notes TEXT
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_competitions_group ON public.competitions(group_id);
CREATE INDEX idx_matches_competition ON public.matches(competition_id);
CREATE INDEX idx_matches_trip ON public.matches(trip_id);
CREATE INDEX idx_match_sides_match ON public.match_sides(match_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_sides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Groups: members can view, creator can manage
CREATE POLICY "Group members can view groups"
  ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator can update"
  ON public.groups FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Group creator can delete"
  ON public.groups FOR DELETE
  USING (auth.uid() = created_by);

-- Group members
CREATE POLICY "Group members can view membership"
  ON public.group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm2
      WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Group creator can manage members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Group creator or self can remove"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
  );

-- Competitions: group members can view, creator can manage
CREATE POLICY "Group members can view competitions"
  ON public.competitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = competitions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create competitions"
  ON public.competitions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = competitions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can update competitions"
  ON public.competitions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = competitions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Teams + team members: same group-member check
CREATE POLICY "Group members can view teams"
  ON public.competition_teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competitions c
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE c.id = competition_teams.competition_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can manage teams"
  ON public.competition_teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitions c
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE c.id = competition_teams.competition_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can view team membership"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competition_teams ct
      JOIN public.competitions c ON c.id = ct.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE ct.id = team_members.team_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can manage team membership"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competition_teams ct
      JOIN public.competitions c ON c.id = ct.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE ct.id = team_members.team_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can delete team membership"
  ON public.team_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.competition_teams ct
      JOIN public.competitions c ON c.id = ct.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE ct.id = team_members.team_id
      AND gm.user_id = auth.uid()
    )
  );

-- Matches
CREATE POLICY "Group members can view matches"
  ON public.matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competitions c
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE c.id = matches.competition_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitions c
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE c.id = matches.competition_id
      AND gm.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Creator can delete matches"
  ON public.matches FOR DELETE
  USING (auth.uid() = created_by);

-- Match sides + results: inherit from match visibility
CREATE POLICY "Group members can view match sides"
  ON public.match_sides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.competitions c ON c.id = m.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE m.id = match_sides.match_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can manage match sides"
  ON public.match_sides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.competitions c ON c.id = m.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE m.id = match_sides.match_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can view match results"
  ON public.match_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.competitions c ON c.id = m.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE m.id = match_results.match_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can manage match results"
  ON public.match_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.competitions c ON c.id = m.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE m.id = match_results.match_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can update match results"
  ON public.match_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.competitions c ON c.id = m.competition_id
      JOIN public.group_members gm ON gm.group_id = c.group_id
      WHERE m.id = match_results.match_id
      AND gm.user_id = auth.uid()
    )
  );

-- ── Real-time ──────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
