import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | The Starter',
  description: 'The Starter is a golf trip planning app built for groups. Tee times, scoring, expenses, and itineraries — all in one place.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#70798C]">About</p>
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#252323]">Built for golf trips. Actually.</h1>

        <div className="space-y-6 text-base leading-relaxed text-[#252323]">
          <p>
            The Starter is a golf trip planning app built for groups. We handle the logistics so you can focus on the golf — tee time coordination, cost splitting, handicap-adjusted betting formats, live scoring, and payout calculations, all in one place.
          </p>

          <p>
            It started with a simple problem: planning a golf trip for 8+ guys is a mess. Spreadsheets for expenses, group texts for tee times, someone always forgetting their score from Saturday's round. We built The Starter to replace all of that with a single link you send to your crew.
          </p>

          <p>
            Built for golf trips of 4 to 20 players. No spreadsheets. No group text chaos.
          </p>

          <div className="my-8 rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#70798C]">What We Handle</h2>
            <ul className="space-y-3">
              {[
                ['⛳', 'Tee Times', 'Schedule rounds, assign foursomes, and send confirmations to everyone'],
                ['🏆', 'Scorecards', 'Enter scores hole-by-hole and watch the leaderboard update in real time'],
                ['💸', 'Expenses', 'Split green fees, lodging, and dinners. Everyone sees exactly what they owe'],
                ['📅', 'Itineraries', 'Day-by-day schedule from arrival dinner to Sunday checkout'],
                ['🤝', 'Side Bets', 'Nassau, skins, match play — track betting formats and calculate payouts'],
                ['📋', 'Group Coordination', 'RSVP tracking, handicap collection, rental coordination'],
              ].map(([emoji, title, desc]) => (
                <li key={title as string} className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">{emoji}</span>
                  <div>
                    <p className="font-medium text-[#252323]">{title}</p>
                    <p className="text-sm text-[#A99985]">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p>
            The Starter is part of the GroupTrip family of products — a suite of tools for planning group travel. GroupTrip handles general group trips; The Starter is the golf-specific product.
          </p>

          <p className="font-medium text-[#252323]">
            thestarter.app — Golf trips, handled.
          </p>
        </div>

        <div className="mt-10 flex gap-4">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 rounded-[5px] bg-[#12733C] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0B442D]"
          >
            Plan Your Golf Trip →
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-[5px] border border-[#DAD2BC] bg-white px-6 py-2.5 text-sm font-medium text-[#252323] transition-colors hover:border-[#A99985]"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  )
}
