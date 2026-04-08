import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Starter — Golf Trip Planner for Your Crew',
  description:
    'Plan your golf trip end-to-end. Split costs, build the itinerary, set the stakes, and send one link. The Starter keeps the group on the same page — before, during, and after.',
  keywords: [
    'golf trip planner',
    'golf group planner',
    'tee time planner',
    'golf scorecard app',
    'golf trip organizer',
    'golf vacation planner',
    'nassau betting',
    'golf skins',
  ],
  openGraph: {
    title: 'The Starter — Golf Trip Planner for Your Crew',
    description:
      'Split costs, build the itinerary, set the stakes. Send one link and The Starter keeps the group on the same page.',
    type: 'website',
    siteName: 'The Starter by GroupTrip',
  },
  twitter: {
    card: 'summary',
    title: 'The Starter — Golf Trip Planner',
    description: 'The whole trip, not just the round.',
  },
}

export default function StarterLanding() {
  return (
    <div className="bg-[#F5F1ED] text-[#092D3D]">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-24 sm:pt-32">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#70798C]">
          The Starter — Golf Trip Planner
        </p>

        <h1 className="font-['Playfair_Display',Georgia,serif] mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#092D3D] sm:text-6xl lg:text-7xl">
          The whole trip,{' '}
          <em className="italic text-[#70798C]">not just the round.</em>
        </h1>

        <p className="mb-10 max-w-xl text-base leading-relaxed text-[#5A7A6B] sm:text-lg">
          Split costs. Build the itinerary. Set the stakes. Send one link and
          The Starter keeps the group on the same page — before, during, and
          after.
        </p>

        <div className="mb-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-[5px] bg-[#092D3D] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#074B63]"
          >
            Plan your trip
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[5px] border border-[#DAD2BC] bg-white px-8 py-3 text-sm font-semibold text-[#092D3D] transition-colors hover:bg-[#F5F1ED]"
          >
            Sign in
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#A99985]">
          <span>Free to start</span>
          <span>No credit card</span>
          <span>Works for groups of 4–20</span>
        </div>
      </section>

      {/* ── Feature Tiles ─────────────────────────────────────────── */}
      <section className="border-t border-[#DAD2BC]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-0 divide-y divide-[#DAD2BC] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 lg:divide-y-0">
            {[
              {
                num: '01',
                title: 'Cost splitting',
                body: 'Green fees, lodging, dinners, carts. Everyone sees what they owe. No more awkward asks or Venmo math.',
                chip: 'No more Venmo math.',
              },
              {
                num: '02',
                title: 'Itinerary & lodging',
                body: 'Build the full schedule. Arrival times, dinners, tee times. One place the group actually checks.',
                chip: 'One link. Whole trip.',
              },
              {
                num: '03',
                title: 'Tee time coordination',
                body: 'Schedule rounds, assign foursomes, keep everyone on the same sheet. No more reply-all chaos.',
                chip: 'Foursomes sorted.',
              },
              {
                num: '04',
                title: 'Foursomes & group maker',
                body: 'Tell it your group size and number of rounds. It builds the pairings so everyone plays with everyone.',
                chip: 'Rotations done.',
              },
              {
                num: '05',
                title: 'Payout calculation',
                body: 'Nassau, skins, wolf — The Starter tracks every bet and calculates the final payout at the 19th. No math.',
                chip: 'Settled at the turn.',
              },
              {
                num: '06',
                title: 'Nassau & skins',
                body: 'Set stakes before the first tee. Bets track automatically as scores come in. Handicap-adjusted.',
                chip: 'Handled at the turn.',
              },
            ].map((tile) => (
              <div
                key={tile.num}
                className="flex flex-col gap-4 px-6 py-10 sm:first:pl-0 lg:first:pl-0"
              >
                <span className="text-xs font-semibold tracking-widest text-[#A99985]">
                  {tile.num}
                </span>
                <h3 className="font-['Playfair_Display',Georgia,serif] text-lg font-bold leading-snug text-[#092D3D]">
                  {tile.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-[#5A7A6B]">
                  {tile.body}
                </p>
                <span className="inline-block self-start rounded-[5px] bg-[#D8EADF] px-3 py-1 text-xs font-medium text-[#074B63]">
                  {tile.chip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI section ────────────────────────────────────────────── */}
      <section className="border-t border-[#DAD2BC] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#70798C]">
                AI trip builder
              </p>
              <h2 className="font-['Playfair_Display',Georgia,serif] mb-6 text-4xl font-bold leading-tight text-[#092D3D] sm:text-5xl">
                Tell us where. We&apos;ll build the trip.
              </h2>
              <p className="text-base leading-relaxed text-[#5A7A6B]">
                Describe your trip and The Starter drafts the itinerary, suggests foursomes, and sets up cost splits — ready to share in minutes. You make the calls. We do the logistics.
              </p>
            </div>
            <div className="space-y-3">
              {[
                '"8 guys, Pinehurst, 4 nights, 3 rounds, Nassau format, budget around $600/head."',
                '"Scottsdale long weekend. TPC + one more course. Skins game, $20 per hole. Need lodging options near Old Town."',
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED] px-5 py-4"
                >
                  <p className="font-mono text-xs leading-relaxed text-[#70798C]">
                    {prompt}
                  </p>
                </div>
              ))}
              <p className="pt-1 text-xs text-[#A99985]">
                The Starter turns this into a full trip draft. You adjust, share, and go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ──────────────────────────────────────────── */}
      <section className="border-t border-[#DAD2BC] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <div className="grid grid-cols-3 divide-x divide-[#DAD2BC]">
                {[
                  { stat: '840+', label: 'Trips planned' },
                  { stat: '$2.4M', label: 'Costs split' },
                  { stat: '4.8', label: 'App rating' },
                ].map((item) => (
                  <div key={item.label} className="px-6 first:pl-0">
                    <p className="font-['Playfair_Display',Georgia,serif] text-3xl font-bold text-[#092D3D]">
                      {item.stat}
                    </p>
                    <p className="mt-1 text-xs text-[#A99985]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:col-span-1">
              <p className="text-sm italic leading-relaxed text-[#70798C]">
                &ldquo;Saved me six group texts and one very uncomfortable
                Venmo request.&rdquo;
              </p>
              <p className="mt-2 text-xs text-[#A99985]">
                — Trip organizer, Pinehurst trip. 2024
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── One link section ──────────────────────────────────────── */}
      <section className="border-t border-[#DAD2BC]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Left copy */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#70798C]">
                The viral entry point
              </p>
              <h2 className="font-['Playfair_Display',Georgia,serif] mb-6 text-4xl font-bold leading-tight text-[#092D3D] sm:text-5xl">
                One link sends the group.
              </h2>
              <p className="text-base leading-relaxed text-[#5A7A6B]">
                The organizer builds the trip once. Everyone else gets a link.
                They see the itinerary, what they owe, and when to show up —
                no account required to view.
              </p>
            </div>

            {/* Invite card mockup */}
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#70798C]">
                You&apos;ve been sent off
              </p>
              <h3 className="font-['Playfair_Display',Georgia,serif] mb-1 text-2xl font-bold text-[#092D3D]">
                Pebble Beach, May 2025
              </h3>
              <p className="mb-6 text-sm text-[#5A7A6B]">
                Marcus added you to a 10-person golf trip
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Dates', value: 'May 9–12' },
                  { label: 'Your share', value: '$680' },
                  { label: 'Rounds', value: '3 rounds' },
                  { label: 'Group size', value: '10 people' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[5px] bg-[#F5F1ED] p-3"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A99985]">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#092D3D]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── On the course ─────────────────────────────────────────── */}
      <section className="border-t border-[#DAD2BC] bg-[#092D3D]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#5A7A6B]">
            On the course
          </p>
          <h2 className="font-['Playfair_Display',Georgia,serif] mb-14 text-4xl font-bold leading-tight text-white sm:text-5xl">
            When the round starts, The Starter runs it.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Live scoring',
                body: 'Scores, handicap adjustments, and leaderboard — updated in real time. Everyone sees where they stand.',
              },
              {
                title: 'Nassau, skins, wolf',
                body: 'Set the format before the first tee. Bets track automatically. Payouts are ready at the 19th.',
              },
              {
                title: 'Payout summary',
                body: 'No more Venmo math. The Starter calculates who owes what across every bet and side game.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-[5px] border border-[#074B63] bg-[#0B3D54] p-6"
              >
                <h3 className="mb-3 font-semibold text-white">{card.title}</h3>
                <p className="text-sm leading-relaxed text-[#B8D4C4]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="border-t border-[#DAD2BC]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-['Playfair_Display',Georgia,serif] mb-4 text-4xl font-bold text-[#092D3D] sm:text-5xl">
            Golf trips, handled.
          </h2>
          <p className="mb-10 text-base text-[#5A7A6B]">
            Free to start. No credit card. Works for groups of 4–20.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-[5px] bg-[#092D3D] px-10 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#074B63]"
          >
            Plan your trip
          </Link>
        </div>
      </section>

    </div>
  )
}
