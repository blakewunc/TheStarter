# ⛳ The Starter

**Group trip planning for your golf crew.** Live at **[thestarter.app](https://thestarter.app)**

Planning a golf trip usually means a group text with 40 messages, three spreadsheets, and one person doing all the work. The Starter replaces that with one shared space where the whole group can plan, vote, and split costs together.

## The problem

Group trips fall apart in the logistics: picking dates, locking in tee times, splitting costs, and keeping everyone in the loop. The organizer carries the load, and everyone else is guessing.

## What it does

- **Invite your crew** with a single shareable link
- **Propose trips** with dates, courses, and lodging for the group to weigh in on
- **Track the budget** so everyone knows what they owe
- **Trip recaps** to share the highlights after the round
- **Clubs** to keep a recurring group or league together between trips
- **Planning guides** on the blog for first time organizers

Built for golf first, with support for bachelor and bachelorette parties and ski trips.

## Who it's for

Groups of friends who travel to play golf together, from the 30 year old organizing the annual buddies trip to the 60 year old who just wants to know where to show up. Simple enough for anyone in the group to use.

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Data and auth | Supabase (Postgres, Auth) |
| Styling | Tailwind CSS 4 |
| AI | Anthropic Claude API |
| Content | MDX blog |
| Hosting | Vercel (Analytics, Speed Insights) |

## Product approach

I own this product end to end: user research with real golf groups, prioritization, design, build, and launch. Development is AI assisted with Claude Code, which lets me move from customer feedback to shipped feature quickly.

**On the roadmap:** tee time booking integration, deeper league features, and expanded trip types.

## Run locally

```bash
npm install
npm run dev   # requires a .env.local with Supabase and Anthropic keys
```

Open [http://localhost:3000](http://localhost:3000).

---

Built by [Blake Williams](https://www.linkedin.com/in/blakejwilliams)
