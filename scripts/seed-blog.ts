/**
 * Seed script — inserts 5 blog articles into the blog_posts table.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (or env).
 *
 * Run:
 *   npx tsx scripts/seed-blog.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const posts = [
  {
    title: 'The Complete Golf Trip Planning Checklist',
    slug: 'golf-trip-planning-checklist',
    category: 'Trip Planning',
    excerpt: 'Month-by-month from idea to first tee — the definitive checklist so nothing slips through.',
    meta_title: 'Golf Trip Planning Checklist | The Starter',
    meta_description: 'Use our complete golf trip planning checklist to organize tee times, lodging, travel, and group finances from idea to first tee.',
    focus_keyword: 'golf trip planning checklist',
    author: 'The Starter',
    published: true,
    content: `# The Complete Golf Trip Planning Checklist

Planning a golf trip with your crew should be one of the best experiences of the year — not a logistical nightmare. The difference between a trip that goes smoothly and one that doesn't usually comes down to one thing: when you started planning.

Here's the checklist we've refined across dozens of group golf trips. Use it month-by-month from the initial idea to wheels-up.

## 4–6 Months Out: The Vision

**Lock in the destination.**
The longer you wait, the fewer tee times you'll have access to — especially at bucket-list courses. Scottsdale, Pinehurst, Pebble Beach, Bandon Dunes — these book up fast.

- Agree on one destination (use a poll in The Starter to settle debate)
- Set a rough date range — work around the hardest calendars first
- Create a trip in The Starter and share the invite link

**Set a budget range.**
Everyone has a different number. Surface it early. Rough categories:
- Flights (if needed)
- Lodging (per night, per person)
- Green fees (per round)
- Food & drink
- Transportation / rentals

Pro tip: Build a 10–15% buffer for the things that always come up — a round of drinks after a great shot, golf cart gratuities, last-minute range time.

**Get headcount confirmation.**
Don't move forward without knowing who's actually in. A soft "probably" costs you money when deposits are non-refundable.

---

## 3 Months Out: The Foundations

**Book tee times.**
This is your single most important task. Everything else can flex. Tee times can't.

- Book the marquee rounds first
- Schedule early tee times — afternoons get hot and rushed
- Add tee times to The Starter so everyone can see the schedule

**Book lodging.**
For groups of 6+, a rental house beats hotel rooms every time. You'll save money, have a place to gather, and someone's always got the good bourbon out.

- VRBO/Airbnb for houses (book early — 3 months minimum for good properties)
- Golf resort packages if you want the full experience
- Confirm check-in/check-out against your tee times

**Book flights.**
If your group is flying, now's the time. Don't wait. Use the budget tracker to log what everyone paid so it's factored into the final split.

---

## 6 Weeks Out: The Details

**Confirm rental cars or transportation.**
One van for 8 is cheaper and more fun than three separate cars. Book early — rental inventory disappears.

**Finalize the itinerary.**
Add everything to The Starter itinerary tab:
- Arrival logistics (who's picking up who?)
- Each round with tee time, course, and foursome
- Dinners — make reservations now
- Any non-golf activities (bourbon distillery, cigar bar, beach day)

**Collect outstanding deposits.**
Use The Starter expense tracker to log deposits and reimbursements. Send out the per-person cost breakdown so no one's surprised.

---

## 2 Weeks Out: Final Check

- Confirm all tee times in writing (call the pro shop)
- Confirm lodging with the host/property manager
- Send the full itinerary to the group
- Coordinate who's bringing what (coolers, supplies, golf balls, etc.)
- Arrange on-course betting format (Nassau is always a good choice)

---

## Week Of: Launch

- Reconfirm car rentals
- Download course GPS apps / yardage books if you're nerds about it
- Set up the Skins or Nassau in The Starter match tracker
- Share final payment breakdowns

---

The key insight after doing this dozens of times: **the trip starts when you send the invite link.** Everything after that is momentum. Get that link out early, and the rest takes care of itself.
`,
  },

  {
    title: 'Nassau Betting: The Format Every Golf Group Needs',
    slug: 'nassau-betting-format-explained',
    category: 'Trip Planning',
    excerpt: 'Front 9, back 9, total — why every golf trip runs a Nassau, and exactly how it works.',
    meta_title: 'Nassau Betting Explained | Golf Trip Formats | The Starter',
    meta_description: 'Learn how Nassau betting works in golf — front 9, back 9, and total match formats. Includes press rules and how to track it with your group.',
    focus_keyword: 'nassau betting golf',
    author: 'The Starter',
    published: true,
    content: `# Nassau Betting: The Format Every Golf Group Needs

Ask anyone who's been on more than two golf trips what format they use and they'll say the same thing: Nassau. It's been the backbone of friendly golf wagering for over a century, and for good reason — it's simple, it creates multiple opportunities to win, and it keeps the match interesting even when someone gets blown out on the front.

## What Is a Nassau?

A Nassau is actually three separate bets wrapped into one:

1. **Front 9** — who wins the first nine holes (match play)
2. **Back 9** — who wins the second nine holes
3. **Overall 18** — who wins the full round

You pick a unit — traditionally $5, $10, or $20 — and that's the value of each of the three bets. So a "$10 Nassau" means three separate $10 matches are on the line.

The beauty: even if someone gets crushed on the front nine, they start fresh on the back. Nobody quits walking.

## The Press

The press is what separates Nassau from every other format. When a player or team is down 2 holes in any segment, they can "press" — meaning they start a new, parallel match within that segment.

**Example:**
- You're 3 down through 6 holes on the front nine
- You press — now there's a new match starting at hole 7 on the front
- The original front-nine match still runs through 9
- The press match runs holes 7–9

One press can become two. It adds side bets, extends the action, and gives the losing side a fighting chance without abandoning the round.

**Auto-press rule:** Many groups play "auto-press" where a press is automatic when you're 2 down. Eliminates the awkward ask.

## How to Track It

For a two-player or two-team match:

| Hole | Score A | Score B | Status |
|------|---------|---------|--------|
| 1 | 4 | 5 | A +1 |
| 2 | 3 | 3 | A +1 |
| 3 | 5 | 4 | Even |
| ... | | | |

Track it hole by hole in match play terms (+1, +2, A/S for all square). At the end of the front 9, settle that bet. Start fresh on the back.

The Starter match tracker handles this automatically — log scores after each hole and it tracks who's up in each segment.

## Four-Ball Nassau (Most Common on Golf Trips)

Most group trips don't play individual Nassau. They play **four-ball** (best ball of two partners vs. best ball of the other two).

The format becomes:
- Team A vs. Team B
- Front 9 Nassau
- Back 9 Nassau
- Total Nassau
- Optional: individual Skins running alongside

Group of 8? Run two simultaneous four-ball Nassau matches and compare results over drinks.

## Skins as a Side Game

Nassau and Skins are natural partners. A Skin is won when one player (or team) wins a hole outright with no ties. Ties carry over — they "push" — so a skin can accumulate for multiple holes and be worth significant value when finally won.

Typical Skins setup on a golf trip:
- $2–5 per skin per player
- All 18 holes eligible
- Must be won clean (no carryover match scenario required)

Skins keep everyone in the action even if the Nassau is a blowout. The guy who's been hacked for 13 holes suddenly wins 4 holes in a row and takes home the skin pot.

## Setting Up in The Starter

1. Go to your trip's Golf tab → My Group
2. Start a new competition — name it (e.g., "Day 1 Nassau — TPC Scottsdale")
3. Assign Team A and Team B with player names
4. Choose your team colors
5. Log match results after each round

The match history, W/L/T stats, and hot streaks are all tracked automatically for the trip.

---

The Nassau isn't going anywhere — it's been the standard for good reason. Simple to explain, impossible to fully master, and just enough money on the line to matter.
`,
  },

  {
    title: 'Pinehurst Golf Trip Guide: Everything Your Group Needs to Know',
    slug: 'pinehurst-golf-trip-guide',
    category: 'Course Guides',
    excerpt: 'Tee times, where to stay, what to eat, and the local knowledge that makes a Pinehurst trip legendary.',
    meta_title: 'Pinehurst Golf Trip Guide 2025 | The Starter',
    meta_description: 'Planning a group golf trip to Pinehurst? Our complete guide covers the best courses, where to stay, dining, and logistics for groups.',
    focus_keyword: 'Pinehurst golf trip',
    author: 'The Starter',
    published: true,
    content: `# Pinehurst Golf Trip Guide: Everything Your Group Needs to Know

Pinehurst, North Carolina is as close to a pilgrimage site as American golf gets. Home to the legendary No. 2 course (eight US Open host), the village that feels like it was built for golf, and enough top-quality courses to fill four days without repeating — it's one of the best group golf trip destinations in the country.

Here's what you need to know before you go.

## Why Pinehurst?

- **Concentration of quality**: 10 resort courses and several standalone tracks within 20 minutes
- **The village**: walkable, charming, with great bars and restaurants — the group can actually hang out
- **No. 2**: a bucket-list round for any serious golfer
- **Weather**: the Sandhills have mild winters — you can play year-round

## The Courses

### Must Play

**Pinehurst No. 2** — Donald Ross's masterpiece. The crowned greens that push errant shots away are unlike anything else in golf. Book this early — it fills up months in advance.

**Pinehurst No. 4** — Gil Hanse redesign (2018) that many serious golfers now prefer to No. 2. More playable for mid-handicappers, still a serious test.

**Pinehurst No. 8** — Tom Fazio design. More forgiving than 2 or 4, great for groups with mixed handicaps. Spectacular scenery.

### Worth Your Time

**Mid South Club** — One of the best kept secrets in the area. Private feel, excellent course conditions, slightly lower green fees.

**Talamore Golf Resort** — Great value, fun course, unique "llama caddy" experience (yes, really — it's a thing). Works perfectly for the "lighten-up round" on day 3.

**The Legacy Golf Club** — Jack Nicklaus design, affordable, excellent condition. Book it as your warmup round on arrival day.

## When to Go

**Spring (March–May):** Best conditions, busiest season. Book 3–4 months out.
**Fall (Sept–Nov):** Second best. Slightly cooler, good conditions, less crowded than spring.
**Winter (Dec–Feb):** Mild and cheap. Courses aren't as pristine but green fees drop significantly.
**Summer:** Avoid if possible — humidity and heat make afternoon rounds miserable.

## Where to Stay

### The Pinehurst Resort (on property)

Staying on property is the experience. You walk out the door and you're at the first tee. The historic Manor Inn and Holly Inn are charming, the Carolina Hotel is the flagship — big porches, old money vibes.

Downside: expensive, and you'll want to play non-resort courses too.

### Village rental homes

VRBO has a good inventory of homes in and around the Village. A group of 8 splitting a house runs significantly cheaper than resort rooms and gives you a home base.

Best areas: The Village of Pinehurst, Southern Pines, Aberdeen.

### Southern Pines hotels

If you're on a budget: Hampton Inn or Homewood Suites in Southern Pines. 15 minutes to most courses, fraction of the price.

## Where to Eat and Drink

**Dugan's Pub** — The unofficial 19th hole of Pinehurst. Cold beer, pub food, golf on every TV. You will end up here.

**The Deuce** — Inside the Pinehurst Resort. Upscale, solid menu, good for the group dinner night.

**Ashten's** — Best fine dining in the area. Make a reservation. Worth it for one special dinner.

**Broad Street Deli** — Great for quick lunch between rounds.

**Southern Pines Brewing** — Do a beer tasting before dinner. Casual, fun, great local beers.

## Logistics for Groups

**Transportation**: One large van or two SUVs is the move. No one wants to arrange carpools every morning.

**Typical 4-day itinerary:**
- Day 1 (arrive afternoon): Legacy or Talamore as a warmup round, dinner at Broad Street
- Day 2: No. 4 morning tee time, afternoon free (range, fitness, recovery), Ashten's for dinner
- Day 3: No. 2 (this is the day — early tee time), The Deuce for lunch, Dugan's for the rest of the afternoon
- Day 4: No. 8 or Mid South, depart

**Green fee range** (2025 estimates):
- Pinehurst No. 2: $350–500 per round
- Pinehurst No. 4: $200–350
- Legacy / Talamore: $80–150
- Mid South: $125–175

Budget $1,200–1,800 in green fees for 4 days of great golf.

## Booking Tips

- No. 2 and No. 4 tee times open 90 days in advance for resort guests, 60 days for public
- Resort packages include better tee time access — sometimes worth the premium
- Call the pro shop directly if you can't get online tee times you want
- Groups of 8 = two foursomes — coordinate tee times back-to-back (same time, same course, first and second tee)

---

Pinehurst is one of those trips that every golfer remembers. Plan it right and it becomes the benchmark every future golf trip gets measured against.
`,
  },

  {
    title: 'How to Plan a Bachelor Party Golf Trip in 30 Days',
    slug: 'bachelor-party-golf-trip-planning',
    category: 'Trip Planning Tips',
    excerpt: 'Most bachelor parties get planned with 30 days or less. Here\'s exactly how to pull it off without the chaos.',
    meta_title: 'Bachelor Party Golf Trip Planning Guide | The Starter',
    meta_description: 'Planning a bachelor party golf trip on short notice? Our 30-day timeline gets you from blank slate to booked trip with no chaos.',
    focus_keyword: 'bachelor party golf trip',
    author: 'The Starter',
    published: true,
    content: `# How to Plan a Bachelor Party Golf Trip in 30 Days

The best man just called you. The wedding is in 8 weeks. "We should do a golf trip for the bachelor party." Classic.

Here's the good news: 30 days is enough time to pull off a great bachelor party golf trip, but only if you move fast and make decisions. The enemy of a good last-minute trip is committee thinking. Someone needs to be in charge.

That someone is you.

## Day 1–3: Make the Core Decisions

These four decisions unlock everything else. Make them in 48 hours or they'll take two weeks.

**Decision 1: Destination**
Pick something within a 2-hour flight (or drive) of where most people are. Last-minute flights are expensive — don't punish people for the timeline. Consider:
- Scottsdale (Phoenix) — consistently great golf, nightlife, easy flights from most cities
- Myrtle Beach — affordable, tons of courses, beach access
- Local golf resort — underrated option, cheaper, easier to coordinate

**Decision 2: Date**
Pick the weekend. Avoid major holidays. Check with the groom first, then the 2–3 people who MUST be there. Everyone else adjusts.

**Decision 3: Budget**
Set a per-person budget range and stick to it. $500–800/person gets you a solid 2-day trip with good golf. $1,200–1,800 gets you a bucket-list experience. Be explicit about what's included (lodging, green fees) vs. separate (flights, food).

**Decision 4: Headcount**
4–8 is ideal. More than 8 gets logistically painful. Cut the list to the people who will actually go.

## Day 4–7: Book the Non-Negotiables

**Book lodging first.**
A rental house for the group is almost always better than hotel rooms. Search VRBO and Airbnb immediately — last-minute inventory exists but shrinks fast.

What to look for:
- Enough bedrooms (don't cram 8 people into 3 rooms)
- Kitchen or outdoor space (cook one dinner in, save money)
- Pool if you're in a warm climate

**Book tee times.**
Call the pro shop directly — online systems sometimes have better availability over the phone, especially last-minute. Explain you're booking for a bachelor party group; pro shops want your business.

Aim for 2 rounds (arrival day optional 9 holes, full round day 2). Don't overschedule. Golf + heat + celebration = a group that fades fast.

## Day 8–14: Lock in the Details

**Book flights if needed.**
Share the best flight options in a group chat. Give people 48 hours to book. If someone can't make it work, adjust headcount.

**Organize transportation.**
Book a van or SUV. Uber/Lyft works in cities but fails in golf resort areas — don't gamble on it.

**Plan the non-golf stuff.**
One nice dinner (make the reservation now), one loose night (no reservation required, keep it flexible). Bachelor parties that are over-scheduled feel like tours. Leave breathing room.

**Create the trip in The Starter.**
- Add the itinerary
- Set up the budget tracker with per-person costs
- Share the invite link with the group
- Add tee times to the golf tab

## Day 15–21: Collect Money and Confirm

**Collect deposits.**
Use the expense tracker to log what's been paid. Send reminders without nagging — once by text, once by group chat, done. If someone hasn't paid by day 20, they're not going.

**Confirm all bookings.**
Call/email the rental property to confirm. Call the pro shop to confirm tee times. Check airline tickets are issued correctly.

**Assign roles.**
- Who's driving from the airport?
- Who's in charge of the supply run (beer, snacks, etc.)?
- Who's making the dinner reservation?

Clarity on this prevents the "I thought you were doing that" conversation.

## Day 22–29: Final Logistics

**Send the full itinerary.**
Share it in The Starter and pin it in the group chat. Include:
- All addresses (lodging, courses, restaurants)
- Tee times with course names
- Any pickup/carpool plans
- Rough schedule for each day

**Pack the essentials.**
Bachelor party golf trips benefit from a little planning on supplies:
- The groom should have a sash, veil, or something that marks him (cheesy is the point)
- Bring more golf balls than you think you'll need
- Consider a custom flag or ball markers for the course

**Set up the match format.**
Decide on Nassau or Skins before you get there. Set it up in The Starter competition tracker so it's ready to go on the first tee.

## Day 30: Launch

Group chat goes out, everyone has the itinerary, money is settled, bags are packed.

The groom's only job is to show up. Your job is done.

---

**The one thing that makes or breaks last-minute trips:** decisiveness. Every hour you spend seeking consensus is an hour where lodging and tee times are disappearing. Make the call, share the plan, let people opt in.

You've got this.
`,
  },

  {
    title: 'Scottsdale Golf Trip: The Group Planner\'s Guide',
    slug: 'scottsdale-golf-trip-guide',
    category: 'Course Guides',
    excerpt: 'Scottsdale has the best golf trip infrastructure in the country. Here\'s how to build a perfect group weekend.',
    meta_title: 'Scottsdale Golf Trip Guide for Groups | The Starter',
    meta_description: 'Planning a group golf trip to Scottsdale? Our guide covers the best courses, resorts, dining, and how to organize a flawless golf weekend.',
    focus_keyword: 'Scottsdale golf trip',
    author: 'The Starter',
    published: true,
    content: `# Scottsdale Golf Trip: The Group Planner's Guide

Scottsdale is the gold standard for group golf trips in the United States, and it's not close. The concentration of world-class courses, the infrastructure for groups, the weather (November through April is nearly perfect), the nightlife, the restaurants — it all adds up to the most reliable golf trip destination in the country.

Here's how to build the perfect group trip.

## Why Scottsdale Works for Groups

- **Density of great courses**: TPC Scottsdale, Troon North, We-Ko-Pa, Grayhawk, Camelback — all within 30 minutes of each other
- **Year-round playability**: Minimal rain, no humidity, winter rounds in short sleeves
- **Resorts built for groups**: Multiple courses on one property, stay-and-play packages, event spaces
- **Non-golf options**: World-class dining, rooftop bars, spa days, desert excursions — something for everyone

## The Best Courses

### Top Tier

**TPC Scottsdale (Stadium Course)** — Home of the Waste Management Phoenix Open. The 16th hole is the most electric in American golf. Tee times here are competitive — book 3+ months out.

**Troon North (Monument Course)** — Consistently rated one of the top 100 courses in the US. The volcanic rock formations make it visually stunning. Morning tee times are magical.

**We-Ko-Pa (Cholla and Saguaro)** — Two championship courses on one property. Native American-operated, incredible desert landscapes. Both courses are outstanding.

**Grayhawk Golf Club (Raptor)** — Great value for the quality. Tech-friendly club with Trackman on the range. The 18th hole is a showcase finisher.

### Great Value Picks

**Camelback Golf Club (Padre Course)** — Solid resort golf at better prices. Good for the warmup round or when the budget is tighter.

**Aguila Golf Course** — Phoenix city course, extremely affordable, well-maintained. Book it for the arrival-day casual round.

**Legend Trail Golf Club** — Hidden gem near Troon. Good conditions, local feel, lower green fees.

## Where to Stay

### Resort Packages (Best Experience)

**The Fairmont Scottsdale Princess** — Home of the Waste Management event, luxurious, attached to TPC Scottsdale. Expensive but the full experience.

**Hyatt Regency Scottsdale at Gainey Ranch** — Golf on property, huge pool complex, great for groups that want the pool scene.

**JW Marriott Scottsdale Camelback Inn** — Iconic property, two courses, quiet and upscale. Great for groups that want a classic Arizona resort.

### Rental Houses (Best Value)

Old Town Scottsdale and North Scottsdale both have excellent VRBO inventory — pools, outdoor kitchens, enough room for 8–12 people. You'll spend half what you'd spend on resort rooms.

Bonus: having a house base means cooking breakfast, poolside afternoons, and a home base for the group to gather.

## When to Go

**November–February**: Peak season. Cool temps, perfect conditions, highest prices. Book 3–4 months out.

**March–April**: Shoulder season. Spring training in town adds tourists but golf is still great. Slightly lower prices.

**October**: Underrated. Heat has broken, crowds thin, prices drop. Excellent golf.

**May–September**: The heat is real. 110°F is not a rumor. Only book summer if you're committed to 5 AM tee times.

## Building the Perfect 3-Day Itinerary

**Day 1:**
- Arrive, check in, hit the range
- Warmup round: Grayhawk or Camelback (afternoon/twilight)
- Dinner: Old Town Scottsdale — try Dominick's or Maple & Ash

**Day 2:**
- TPC Scottsdale Stadium Course (early morning tee time)
- Afternoon: pool / recovery
- Evening: cocktails at a rooftop, nice group dinner

**Day 3:**
- Troon North Monument or We-Ko-Pa
- Late checkout or airport afternoon

## Dining Highlights

**Breakfast before the round:**
- The Original Pancake House (classic, huge portions)
- Snooze AM Eatery (lines, worth it)

**Post-round lunch:**
- LGO Gastropub — beer selection is exceptional
- McFate Brewing — casual, solid food

**Nice group dinners:**
- Mastro's City Hall Steakhouse — the bachelor party steakhouse
- Bourbon Steak at the Fairmont — top tier
- Zinc Bistro — good value, French, underrated

**Bars:**
- Old Town Scottsdale bar district — Bottled Blonde, Riot House, Dierks Bentley's Whiskey Row
- Four Seasons rooftop for the view

## Group Logistics

**Transportation**: Book a van service or charter a Sprinter. Getting 8 guys to TPC Scottsdale at 6:30 AM via Uber is a nightmare. A van solves everything.

**Green fee range** (2025):
- TPC Scottsdale Stadium: $250–400
- Troon North: $175–300
- We-Ko-Pa: $150–250
- Grayhawk Raptor: $100–175

Budget $600–900 per person in green fees for 3 days of great golf.

## Setting Up Competitions

Use The Starter to track your Nassau and Skins matches. Set up the competition before you leave:
- Create a competition for each day's round
- Assign teams or go individual
- Log scores after each hole to watch the leaderboard update

The group's W/L/T record and hot streak tracker runs all trip — creates genuine stakes and something to talk about between holes.

---

Scottsdale earns its reputation. It consistently delivers on the promise of a great group golf trip — and unlike some destinations, the infrastructure is built for exactly what you're trying to do.

Book the tee times first. Everything else follows.
`,
  },
]

async function main() {
  console.log(`Seeding ${posts.length} blog posts…`)

  for (const post of posts) {
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(
        {
          ...post,
          featured_image_url: null,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          focus_keyword: post.focus_keyword,
        },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single()

    if (error) {
      console.error(`  ✗ ${post.slug}:`, error.message)
    } else {
      console.log(`  ✓ ${data.slug} (${data.id})`)
    }
  }

  console.log('Done.')
}

main()
