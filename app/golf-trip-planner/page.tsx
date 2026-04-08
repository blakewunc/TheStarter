import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Golf Trip Planner — Plan Your Group Golf Trip | The Starter',
  description:
    'Everything you need to plan a group golf trip. Timelines, logistics, course selection, betting formats, and cost splitting — all in one place.',
  keywords: [
    'golf trip planner',
    'plan a golf trip',
    'group golf trip',
    'golf trip planning',
    'golf trip checklist',
    'golf trip organizer',
  ],
  openGraph: {
    title: 'Golf Trip Planner | The Starter',
    description: 'Plan your group golf trip end-to-end. Timelines, logistics, course selection, and betting formats.',
    type: 'article',
    siteName: 'The Starter by GroupTrip',
  },
}

export default function GolfTripPlannerPage() {
  return (
    <div style={{ background: '#F5F1ED', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: '#1C1A17', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.40)', marginBottom: '16px', fontWeight: 600 }}>
            The Starter — Golf Trip Planner
          </p>
          <h1 style={{ fontSize: '38px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.15, marginBottom: '16px' }}>
            Golf Trip Planner
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(245,241,237,0.55)', lineHeight: 1.7, maxWidth: '560px' }}>
            A group golf trip has more moving parts than it looks. Here's how to handle all of them — from the first text to the last payout at the 19th hole.
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '56px 24px 80px' }}>

        <div className="prose prose-stone max-w-none prose-headings:font-medium prose-headings:text-[#1C1A17] prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[#3C3835] prose-p:leading-8 prose-p:text-base prose-li:text-[#3C3835] prose-li:leading-relaxed prose-ul:my-4 prose-ol:my-4 prose-strong:text-[#1C1A17] prose-strong:font-semibold prose-a:text-[#70798C] prose-a:no-underline hover:prose-a:underline prose-hr:border-[rgba(28,26,23,0.10)] prose-hr:my-10">

          <p>
            Most golf trips fall apart not on the course but in the group chat. Someone doesn't know the tee time. Someone else missed the Venmo request. The betting format gets argued about on the first tee. This guide is about preventing all of that.
          </p>

          <h2>The Planning Timeline</h2>

          <p>
            Group golf trips require more lead time than people expect. The courses worth playing — Pinehurst, Pebble Beach, Bandon, any private access — have tee sheets that fill months out. Start earlier than you think you need to.
          </p>

          <h3>Three to six months out</h3>
          <ul>
            <li><strong>Lock the dates.</strong> Get a firm commitment from everyone before you book anything. A tentative "probably" turns into a cancellation fee.</li>
            <li><strong>Choose the destination.</strong> Drive-to versus fly-to changes the entire budget math. Factor in the full cost: flights, car rental, lodging, green fees, food, and betting stakes.</li>
            <li><strong>Book tee times.</strong> For premier destinations, six months is not early. Some courses open their books a year out.</li>
            <li><strong>Secure lodging.</strong> A rental house near the course beats a hotel — one kitchen, one common area, no one disappearing at 9pm.</li>
          </ul>

          <h3>Four to six weeks out</h3>
          <ul>
            <li><strong>Collect deposits.</strong> People who have money in the trip show up. Use <Link href="/">The Starter</Link> to track what everyone owes and send automatic reminders.</li>
            <li><strong>Confirm foursomes.</strong> Decide who's playing with whom and when. If you have more than eight people, this requires actual coordination — assign it to one person.</li>
            <li><strong>Set the betting format.</strong> Decide on Nassau, skins, wolf, or a combination before you get there. Agreeing on format and stakes in the group chat is easier than arguing about it on the first tee.</li>
          </ul>

          <h3>One to two weeks out</h3>
          <ul>
            <li><strong>Send the trip link.</strong> Everyone should know the full schedule: arrival times, tee times, dinner reservations, checkout. One link, no reply-all threads.</li>
            <li><strong>Confirm handicaps.</strong> Collect current handicap indexes from everyone. For net formats, you'll need accurate numbers.</li>
            <li><strong>Assign a scorekeeper.</strong> Whoever runs the scoring app is a hero. Make it official.</li>
          </ul>

          <hr />

          <h2>Group Logistics</h2>

          <p>
            Coordinating eight to sixteen people across multiple days is an organizational problem. The golf is the easy part.
          </p>

          <h3>Transportation</h3>
          <p>
            Rental cars versus car services versus rideshare depends entirely on your group size and destination. For groups over eight, renting a 12-passenger van is almost always worth it. One vehicle, one meeting point, no one getting lost.
          </p>

          <h3>Foursomes and pairings</h3>
          <p>
            How you arrange foursomes shapes the entire trip. A few principles that hold up: mix skill levels across groups so each game is competitive, rotate partners across rounds so everyone plays with everyone, and don't put the two people who will argue about rulings in the same cart.
          </p>
          <p>
            The <Link href="/">Foursomes tool</Link> in The Starter handles the rotation math automatically — input your group, tell it how many rounds, and it produces pairings that balance the group across the trip.
          </p>

          <h3>Cost splitting</h3>
          <p>
            Green fees, lodging, cart fees, range balls, dinners, a side bet on the back nine — group golf trips have a lot of line items. The cleaner you handle money, the fewer awkward conversations you have.
          </p>
          <p>
            The standard approach: one person puts everything on a card and gets reimbursed. The better approach: use a <Link href="/">golf trip planner</Link> that tracks shared costs, splits them automatically, and tells everyone exactly what they owe. No spreadsheet, no Venmo math, no guessing.
          </p>

          <h3>Itinerary and communication</h3>
          <p>
            Send a complete schedule before departure. Tee times, arrival windows, dinner plans, checkout logistics. If someone has to ask a question that's already in the itinerary, the itinerary failed. Make it one link everyone can reference — not a PDF buried in a thread.
          </p>

          <hr />

          <h2>Course Selection</h2>

          <p>
            The course is the centerpiece. A few things worth considering when choosing:
          </p>

          <h3>Match the skill spread in your group</h3>
          <p>
            A 36-handicap playing from the tips at a US Open venue is miserable. Check each course's rating and slope and confirm the forward tees are reasonable for your highest handicaps. Most courses offer four or five sets of tees — use them.
          </p>

          <h3>Play a variety</h3>
          <p>
            On a multi-day trip, mix the style of courses. A links-style track and a tree-lined parkland course feel different enough to hold attention. Playing the same type of course three days in a row gets old faster than people expect.
          </p>

          <h3>The must-play versus the warm-up</h3>
          <p>
            Schedule the marquee course for day two, not day one. Day one, people are still shaking off travel, arguing about rentals, finding their rhythm. Day two is when they're ready to play their best golf. Save Pinehurst No. 2 for when the group is actually present.
          </p>

          <h3>Destination ideas</h3>
          <p>
            A few destinations worth building a trip around, depending on your group's budget and travel range. For detailed planning guides, see the <Link href="/blog">blog</Link>.
          </p>
          <ul>
            <li><strong>Pinehurst, NC</strong> — Eight championship courses, a golf village, walkable. Best in May and September.</li>
            <li><strong>Pebble Beach, CA</strong> — The bucket list. Budget accordingly. Companion courses at Spyglass and Monterey Peninsula carry it.</li>
            <li><strong>Bandon Dunes, OR</strong> — Walking only. Pure golf. Five courses on the Oregon coast. No cars on the course is the point.</li>
            <li><strong>Scottsdale, AZ</strong> — TPC Scottsdale, Whisper Rock, We-Ko-Pa. Desert golf in winter or spring. Easy flights from most of the country.</li>
            <li><strong>Myrtle Beach, SC</strong> — 80+ courses within 30 miles. Affordable. Great for groups that want to play a lot.</li>
          </ul>

          <hr />

          <h2>Betting Formats</h2>

          <p>
            A well-run betting format makes a good round great. A poorly explained one causes arguments on the 14th hole. Set the format the night before and make sure everyone understands it before the first tee shot.
          </p>

          <h3>Nassau</h3>
          <p>
            Three bets in one: front nine, back nine, and overall 18. Probably the most common format in recreational golf. Works best in match play (hole-by-hole scoring rather than total strokes). Press options — doubling the bet when you're down — add action on the back nine.
          </p>

          <h3>Skins</h3>
          <p>
            Each hole has a dollar value. Win the hole outright and you take the skin. Tie and the skin carries over. A carryover on a par-5 with four skins in the pot creates exactly the kind of moment that gets talked about for years.
          </p>

          <h3>Wolf</h3>
          <p>
            A four-person format where players rotate as the Wolf — the player who picks a partner (or goes alone) after each tee shot. More complex, higher variance, good for groups that want something more strategic. Explain it twice before you start.
          </p>

          <h3>Stableford</h3>
          <p>
            Points-based scoring that rewards birdies and limits the damage from blow-up holes. Good for mixed-skill groups because a double bogey costs points but doesn't destroy the round. Keeps everyone in it longer.
          </p>

          <p>
            The Starter handles all of these automatically — input the format and stakes before the round, track scores on your phone, and payouts are calculated at the 19th hole. No spreadsheet, no argument.
          </p>

          <hr />

          <h2>What to Build First</h2>

          <p>
            The hardest part of planning a golf trip isn't logistics — it's starting. Here's what to actually do first:
          </p>

          <ol>
            <li>Text the group with two or three date ranges and ask for a quick yes/no. Don't ask for opinions on destination until you have dates.</li>
            <li>Once dates are locked, pick the destination and book the anchor course. Everything else fills around it.</li>
            <li>Create the trip in <Link href="/signup">The Starter</Link>, send the invite link, and let the group fill in their details.</li>
            <li>Collect deposits early. The trip becomes real when money is in.</li>
          </ol>

          <p>
            That's it. The rest of the planning — foursomes, format, dinner reservations — can happen in the two weeks before. Start with dates and an anchor tee time, and the rest follows.
          </p>

        </div>

        {/* CTA */}
        <div style={{ marginTop: '56px', background: '#1C1A17', borderRadius: '8px', padding: '36px', textAlign: 'center' }}>
          <p style={{ fontSize: '20px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '8px' }}>
            Ready to plan your trip?
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(245,241,237,0.50)', marginBottom: '24px', lineHeight: 1.7 }}>
            You book the tee times. We handle everything else.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{ display: 'inline-block', background: '#F5F1ED', color: '#1C1A17', borderRadius: '5px', padding: '12px 28px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}
            >
              Start planning →
            </Link>
            <Link
              href="/trips/new"
              style={{ display: 'inline-block', background: 'transparent', color: 'rgba(245,241,237,0.60)', border: '0.5px solid rgba(245,241,237,0.20)', borderRadius: '5px', padding: '12px 28px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textDecoration: 'none' }}
            >
              Build a trip
            </Link>
          </div>
        </div>

        {/* Internal links */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '0.5px solid rgba(28,26,23,0.10)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', fontWeight: 600, marginBottom: '16px' }}>
            More from The Starter
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { href: '/blog', label: 'Golf trip guides' },
              { href: '/blog/pinehurst-golf-trip-guide', label: 'Pinehurst guide' },
              { href: '/blog/how-to-split-costs-golf-trip', label: 'Splitting costs' },
              { href: '/blog/poor-mans-golf-bucket-list', label: 'Bucket list trips' },
              { href: '/', label: 'Back to The Starter' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ fontSize: '12px', color: '#70798C', textDecoration: 'none', background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '5px', padding: '8px 14px' }}
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
