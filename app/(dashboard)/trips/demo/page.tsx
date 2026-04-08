import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DEMO_TRIP } from '@/lib/demo-trip'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo Trip — Pinehurst Boys Trip | The Starter',
  description: 'See how The Starter handles tee times, scorecards, expenses, and itineraries for a real golf trip.',
}

export default function DemoTripPage() {
  const totalExpenses = DEMO_TRIP.expenses.reduce((sum, e) => sum + e.total, 0)

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0B442D] to-[#092D3D] px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-3 inline-flex items-center rounded-[5px] bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#8ECC7A]">
            Demo Trip
          </span>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {DEMO_TRIP.title}
          </h1>
          <p className="mb-1 text-lg text-white/70">{DEMO_TRIP.destination}</p>
          <p className="text-sm text-white/50">{DEMO_TRIP.dates} · {DEMO_TRIP.players} players</p>

          {/* Avatar stack */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {DEMO_TRIP.scores.map((s, i) => (
              <div
                key={s.player}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/20 text-xs font-semibold text-white"
                style={{ backgroundColor: ['#70798C','#4A7C59','#8B7355','#6B8E7B','#7C6B8E','#5A7A6B','#8B4444','#B8956A'][i % 8] }}
                title={s.player}
              >
                {s.player[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">

        {/* Tee Times */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#70798C]">Tee Times</h2>
          <div className="space-y-3">
            {DEMO_TRIP.rounds.map((round) => (
              <div key={round.id} className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#252323]">{round.course}</p>
                    <p className="mt-0.5 text-sm text-[#A99985]">{round.date} · {round.teeTime}</p>
                    <p className="mt-0.5 text-xs text-[#A99985]">Par {round.par} · {round.players.length} players</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs font-medium text-[#4A7C59]">
                    Confirmed
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {round.players.map((p) => (
                    <span key={p} className="rounded-full bg-[#F5F1ED] px-2.5 py-0.5 text-xs text-[#70798C]">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#70798C]">Leaderboard</h2>
          <div className="rounded-[5px] border border-[#DAD2BC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            {DEMO_TRIP.scores
              .map(s => ({ ...s, total: s.round1 + s.round2 }))
              .sort((a, b) => a.total - b.total)
              .map((s, i) => (
                <div
                  key={s.player}
                  className={`flex items-center justify-between px-5 py-3.5 ${i < DEMO_TRIP.scores.length - 1 ? 'border-b border-[#F5F1ED]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-sm font-bold ${i === 0 ? 'text-[#B8956A]' : 'text-[#A99985]'}`}>{i + 1}</span>
                    <span className="font-medium text-[#252323]">{s.player}</span>
                    {i === 0 && <span className="text-sm">🏆</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#A99985]">
                    <span>{s.round1}</span>
                    <span>·</span>
                    <span>{s.round2}</span>
                    <span className="ml-1 font-bold text-[#252323]">{s.total}</span>
                  </div>
                </div>
              ))}
          </div>
          <p className="mt-2 text-right text-xs text-[#A99985]">{DEMO_TRIP.bettingFormat}</p>
        </div>

        {/* Itinerary */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#70798C]">Itinerary</h2>
          <div className="space-y-4">
            {DEMO_TRIP.itinerary.map((day) => (
              <div key={day.day}>
                <h3 className="mb-2 text-sm font-semibold text-[#252323]">{day.day}</h3>
                <div className="space-y-1.5">
                  {day.events.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-[5px] border border-[#DAD2BC] bg-white px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#12733C]" />
                      <span className="text-sm text-[#252323]">{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#70798C]">Expenses</h2>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[5px] border-2 border-[#70798C] bg-white p-4 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              <p className="text-3xl font-bold text-[#70798C]">${DEMO_TRIP.totalPerPerson.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#A99985]">Per Person</p>
            </div>
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-bold text-[#252323]">${totalExpenses.toLocaleString()}</p>
              <p className="mt-1 text-xs text-[#A99985]">Total</p>
            </div>
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-bold text-[#252323]">{DEMO_TRIP.players}</p>
              <p className="mt-1 text-xs text-[#A99985]">Players</p>
            </div>
          </div>
          <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="space-y-3">
              {DEMO_TRIP.expenses.map((expense) => (
                <div key={expense.item} className="flex items-center justify-between border-b border-[#F5F1ED] pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-[#252323]">{expense.item}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-[#252323]">${expense.total.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-[#A99985]">(${expense.perPerson}/person)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="mb-2 text-base font-semibold text-[#252323]">Ready to plan your own trip?</p>
          <p className="mb-4 text-sm text-[#A99985]">
            The Starter handles tee times, scoring, expenses, and itineraries — everything your golf crew needs.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-[#12733C] text-white hover:bg-[#0B442D]">
                Plan Your Golf Trip — Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="py-6 text-center">
        <Link href="/trips" className="text-sm text-[#A99985] underline-offset-2 hover:underline">
          ← Back to trips
        </Link>
      </div>
    </div>
  )
}
