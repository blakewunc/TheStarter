-- ──────────────────────────────────────────────────────────────────────────────
-- Migration 018: Blog posts + site settings
-- Run in Supabase SQL editor
-- ──────────────────────────────────────────────────────────────────────────────

-- Blog posts table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  excerpt text,
  content text not null,
  meta_title text,
  meta_description text,
  focus_keyword text,
  published boolean default false,
  featured_image_url text,
  author text default 'The Starter',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on edits
create or replace function public.update_blog_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.update_blog_updated_at();

-- RLS: public can read published posts only
alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published posts" on public.blog_posts;
create policy "Public can read published posts"
  on public.blog_posts for select
  using (published = true);

drop policy if exists "Authenticated users have full access to blog" on public.blog_posts;
create policy "Authenticated users have full access to blog"
  on public.blog_posts for all
  using (auth.role() = 'authenticated');

-- Index for slug lookups and listing
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_published on public.blog_posts(published, created_at desc);

-- ──────────────────────────────────────────────────────────────────────────────
-- Site settings (landing page feature tiles, logo URL, etc.)
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Authenticated users manage settings" on public.site_settings;
create policy "Authenticated users manage settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated');

-- Seed default feature tiles
insert into public.site_settings (key, value) values (
  'landing_features',
  '{"features": [
    {"icon": "🏌️", "title": "Tee Time Coordination", "description": "One place for the whole group to see and confirm tee times."},
    {"icon": "💰", "title": "Cost Splitting", "description": "No more Venmo math. The Starter does it."},
    {"icon": "🎯", "title": "Betting Formats", "description": "Nassau, skins, Wolf. Handicap-adjusted. Payouts calculated automatically."},
    {"icon": "📋", "title": "Trip Itinerary", "description": "Lodging, tee times, and group logistics in one shareable link."}
  ]}'::jsonb
) on conflict (key) do nothing;

insert into public.site_settings (key, value) values (
  'site_logo',
  '{"url": null}'::jsonb
) on conflict (key) do nothing;
