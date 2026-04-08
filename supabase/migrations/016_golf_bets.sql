CREATE TABLE IF NOT EXISTS public.golf_bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  tee_time_id UUID REFERENCES public.golf_tee_times(id) ON DELETE SET NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('low_gross', 'low_net', 'closest_to_pin', 'longest_drive', 'nassau', 'skins', 'custom')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  participants UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'settled')),
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES public.shared_expenses(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_golf_bets_trip_id ON public.golf_bets(trip_id);
CREATE INDEX idx_golf_bets_status ON public.golf_bets(status);
CREATE INDEX idx_golf_bets_tee_time ON public.golf_bets(tee_time_id);

ALTER TABLE public.golf_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view golf bets"
  ON public.golf_bets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create golf bets"
  ON public.golf_bets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Creators and organizers can update golf bets"
  ON public.golf_bets FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'organizer'
    )
  );

CREATE POLICY "Creators and organizers can delete golf bets"
  ON public.golf_bets FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'organizer'
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.golf_bets;
