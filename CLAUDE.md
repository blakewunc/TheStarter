# GroupTrip / The Starter

## Project

Collaborative trip planning SaaS with two brands on a single codebase:

- **GroupTrip** (`grouptrip-mu.vercel.app`) — general group trips: bachelor parties, bachelorette parties, ski trips
- **The Starter** (`thestarter.app`) — golf-focused brand with ad monetization, pitched separately to golfers

**Current priority:** The Starter golf experience.

## Tech Stack

- **Framework:** Next.js 16.1.6, React 19, TypeScript
- **Styling:** Tailwind CSS v4, utility-class only (no CSS modules, no styled-components)
- **Database:** Supabase Postgres with Row-Level Security
- **Auth:** Supabase Auth (email/password, magic link, Google OAuth)
- **Real-time:** Supabase Realtime subscriptions
- **AI:** Anthropic Claude API for trip planning assistant
- **Hosting:** Vercel with custom domains
- **Ads:** Google AdSense (The Starter only)

## Architecture

### Brand System

Hostname detection in `middleware.ts` sets `x-brand` header. `app/layout.tsx` reads it, wraps app in `BrandProvider` (`lib/BrandProvider.tsx`), and sets `data-brand` attribute on `<html>` for CSS variable overrides in `app/globals.css`.

- Brand config: `lib/brand.ts`
- Context hook: `useBrand()` from `lib/BrandProvider.tsx`
- CSS overrides: `[data-brand="starter"]` block in `app/globals.css`

### Color Palettes

**GroupTrip (A&K luxury):** `#252323` text, `#70798C` accent, `#F5F1ED` bg, `#DAD2BC` borders, `#A99985` muted
**The Starter (golf greens):** `#092D3D` text, `#074B63` accent, `#D8EADF` bg, `#B8D4C4` borders, `#5A7A6B` muted

### Data Fetching Pattern

1. React hooks (`lib/hooks/use*.ts`) fetch via API routes
2. API routes (`app/api/`) authenticate and query Supabase
3. Real-time subscriptions via Supabase channels in hooks
4. Zod validation schemas in `lib/validations/`

### Key Patterns

- **API routes:** Always `await params` for Next.js 16 async params. Always verify trip membership before operations.
- **Components:** Hardcoded hex colors with `bg-[#hex]` Tailwind syntax. `rounded-[5px]` border radius everywhere. `shadow-[0_1px_3px_rgba(0,0,0,0.06)]` for card shadows.
- **Real-time hooks:** Fetch initial data, subscribe to Supabase channel, refetch on change, clean up on unmount.

## Database

Schema in `supabase/migrations/` (001-013). Key tables:

- `profiles`, `trips`, `trip_members` — core
- `budget_categories`, `budget_splits` — budgeting
- `itinerary_items`, `comments` — itinerary
- `shared_expenses`, `expense_splits` — expenses
- `golf_tee_times`, `golf_scores`, `golf_equipment`, `golf_course_ratings` — golf module
- `ski_tickets`, `ski_abilities`, `ski_rentals` — ski module

Always check actual schema columns before writing queries. Run migrations via Supabase SQL Editor.

## Commands

- `npm run dev` — dev server on localhost:3000
- `npm run build` — production build (always run before pushing)
- `npx supabase gen types typescript` — regenerate types after schema changes

## Rules

- Never commit `.env.local` or secrets
- Always run `npm run build` and verify before pushing
- Prefer editing existing files over creating new ones
- No dark mode — neither brand uses it
- Ad slots (`components/ads/AdSlot.tsx`) only render on The Starter brand
- Use `sonner` for toast notifications, not alert()
