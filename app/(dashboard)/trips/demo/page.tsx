'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, LayoutGrid, Calendar, Receipt, Trophy } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// ─── Demo data ────────────────────────────────────────────────────────────────

const PLAYERS = [
  { id: '1', name: 'Mike R.', initials: 'MR', color: 'bg-[#70798C]' },
  { id: '2', name: 'James T.', initials: 'JT', color: 'bg-[#A99985]' },
  { id: '3', name: 'Chris L.', initials: 'CL', color: 'bg-[#8B7355]' },
  { id: '4', name: 'Dave P.', initials: 'DP', color: 'bg-[#6B8E7B]' },
  { id: '5', name: 'Steve W.', initials: 'SW', color: 'bg-[#7C6B8E]' },
  { id: '6', name: 'Tom B.', initials: 'TB', color: 'bg-[#70798C]' },
  { id: '7', name: 'Ryan K.', initials: 'RK', color: 'bg-[#A99985]' },
  { id: '8', name: 'Brad M.', initials: 'BM', color: 'bg-[#8B7355]' },
]

const TEE_TIMES = [
  {
    id: '1',
    date: 'Thu, May 15',
    course: 'Pinehurst No. 4',
    time: '8:00 AM',
    players: ['Mike R.', 'James T.', 'Chris L.', 'Dave P.'],
    group: 'Group A',
  },
  {
    id: '2',
    date: 'Thu, May 15',
    course: 'Pinehurst No. 4',
    time: '8:10 AM',
    players: ['Steve W.', 'Tom B.', 'Ryan K.', 'Brad M.'],
    group: 'Group B',
  },
  {
    id: '3',
    date: 'Fri, May 16',
    course: 'Pinehurst No. 2',
    time: '7:30 AM',
    players: ['Mike R.', 'James T.', 'Chris L.', 'Dave P.'],
    group: 'Group A',
  },
  {
    id: '4',
    date: 'Fri, May 16',
    course: 'Pinehurst No. 2',
    time: '7:40 AM',
    players: ['Steve W.', 'Tom B.', 'Ryan K.', 'Brad M.'],
    group: 'Group B',
  },
]

const ITINERARY = [
  {
    date: 'Wed, May 14',
    items: [
      { time: '3:00 PM', title: 'Arrive & Check In', location: 'The Carolina Hotel, Pinehurst', description: 'Check in at the front desk. Rooms are reserved under "Boys Trip 2025".' },
      { time: '7:00 PM', title: 'Welcome Dinner', location: 'The Deuce Bar & Grille', description: 'Casual dinner, first round of drinks on the group fund. Get loosened up.' },
    ],
  },
  {
    date: 'Thu, May 15',
    items: [
      { time: '7:00 AM', title: 'Breakfast at the Clubhouse', location: 'Pinehurst Clubhouse', description: 'Grab coffee and breakfast before the first round.' },
      { time: '8:00 AM', title: 'Round 1 — Pinehurst No. 4', location: 'Pinehurst No. 4', description: 'Groups tee off at 8:00 and 8:10 AM. Cart fees included. Dress code enforced.' },
      { time: '1:30 PM', title: 'Lunch & 19th Hole', location: 'Tavern at the Carolina', description: 'Post-round lunch and highlights recap. Worst score buys the first round.' },
      { time: '7:30 PM', title: 'Dinner Reservation', location: 'The Dunn Room', description: 'Private dining room reserved. Dress smart casual.' },
    ],
  },
  {
    date: 'Fri, May 16',
    items: [
      { time: '6:45 AM', title: 'Early Breakfast', location: 'Pinehurst Clubhouse', description: 'Earlier start today — light breakfast recommended.' },
      { time: '7:30 AM', title: 'Round 2 — Pinehurst No. 2', location: 'Pinehurst No. 2', description: 'The main event. Legendary course. Focus up.' },
      { time: '1:00 PM', title: 'Lunch', location: '1895 Grill', description: 'Celebratory post-round lunch. Low scorer picks the restaurant next time.' },
      { time: '4:00 PM', title: 'Free Time / Pool', location: 'The Carolina Hotel', description: 'Rest up, hit the pool, grab a beer.' },
      { time: '7:00 PM', title: 'Group Dinner', location: 'Pine Crest Inn', description: 'Final group dinner. Awards & scorecard roasting.' },
    ],
  },
  {
    date: 'Sat, May 17',
    items: [
      { time: '9:00 AM', title: 'Brunch & Checkout', location: 'The Carolina Hotel', description: 'Late checkout at 11 AM. Brunch in the dining room. Safe travels.' },
    ],
  },
]

const EXPENSES = [
  { id: '1', description: 'Green Fees — Pinehurst No. 4 (8 players)', amount: 1920, paidBy: 'Mike R.', split: 'equal', perPerson: 240 },
  { id: '2', description: 'Green Fees — Pinehurst No. 2 (8 players)', amount: 2160, paidBy: 'James T.', split: 'equal', perPerson: 270 },
  { id: '3', description: 'Cart Fees — Both Rounds', amount: 480, paidBy: 'Chris L.', split: 'equal', perPerson: 60 },
  { id: '4', description: 'Lodging — The Carolina Hotel (4 nights)', amount: 2800, paidBy: 'Dave P.', split: 'equal', perPerson: 350 },
  { id: '5', description: 'Welcome Dinner', amount: 480, paidBy: 'Mike R.', split: 'equal', perPerson: 60 },
  { id: '6', description: 'Group Dinners (x2)', amount: 680, paidBy: 'Steve W.', split: 'equal', perPerson: 85 },
]

const TOTAL_PER_PERSON = EXPENSES.reduce((sum, e) => sum + e.perPerson, 0)

// Scorecard: 9 holes, 8 players
const PAR = [4, 5, 3, 4, 4, 5, 3, 4, 4]
const SCORECARD = [
  { player: 'Mike R.',  scores: [4, 5, 3, 5, 4, 6, 3, 4, 5] },
  { player: 'James T.', scores: [5, 5, 4, 4, 5, 5, 4, 4, 4] },
  { player: 'Chris L.', scores: [4, 6, 3, 4, 4, 5, 4, 5, 4] },
  { player: 'Dave P.',  scores: [5, 5, 4, 5, 4, 6, 3, 4, 5] },
  { player: 'Steve W.', scores: [4, 5, 3, 4, 5, 5, 3, 4, 4] },
  { player: 'Tom B.',   scores: [5, 6, 4, 5, 5, 6, 4, 5, 5] },
  { player: 'Ryan K.',  scores: [4, 5, 3, 4, 4, 5, 3, 4, 4] },
  { player: 'Brad M.',  scores: [5, 5, 4, 4, 5, 5, 3, 4, 5] },
]

function scoreColor(score: number, par: number) {
  const diff = score - par
  if (diff <= -2) return 'bg-yellow-100 text-yellow-800 font-bold'
  if (diff === -1) return 'bg-red-100 text-red-700 font-semibold'
  if (diff === 0) return 'text-[#252323]'
  if (diff === 1) return 'text-[#70798C]'
  return 'text-[#A99985]'
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function DemoOverview() {
  return (
    <div className="space-y-6">
      {/* Trip summary card */}
      <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-lg font-bold text-[#252323]">Trip Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[5px] bg-[#F5F1ED] p-4">
            <p className="text-xs uppercase tracking-wide text-[#A99985]">Dates</p>
            <p className="mt-1 font-semibold text-[#252323]">May 14–17, 2025</p>
            <p className="text-sm text-[#A99985]">4 days, 3 nights</p>
          </div>
          <div className="rounded-[5px] bg-[#F5F1ED] p-4">
            <p className="text-xs uppercase tracking-wide text-[#A99985]">Players</p>
            <p className="mt-1 font-semibold text-[#252323]">8 players</p>
            <p className="text-sm text-[#A99985]">All confirmed</p>
          </div>
          <div className="rounded-[5px] bg-[#F5F1ED] p-4">
            <p className="text-xs uppercase tracking-wide text-[#A99985]">Rounds</p>
            <p className="mt-1 font-semibold text-[#252323]">2 rounds</p>
            <p className="text-sm text-[#A99985]">No. 2 & No. 4</p>
          </div>
          <div className="rounded-[5px] bg-[#F5F1ED] p-4">
            <p className="text-xs uppercase tracking-wide text-[#A99985]">Per Person</p>
            <p className="mt-1 font-semibold text-[#252323]">${TOTAL_PER_PERSON}</p>
            <p className="text-sm text-[#A99985]">All-inclusive</p>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-lg font-bold text-[#252323]">Players</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLAYERS.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-[5px] border border-[#DAD2BC] px-4 py-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${p.color}`}>
                <span className="text-xs font-bold text-white">{p.initials}</span>
              </div>
              <div>
                <p className="font-medium text-[#252323]">{p.name}</p>
                <p className="text-xs text-[#4A7C59]">✓ Going</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tee time preview */}
      <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-lg font-bold text-[#252323]">Tee Times</h2>
        <div className="space-y-3">
          {TEE_TIMES.slice(0, 2).map((tt) => (
            <div key={tt.id} className="flex items-center justify-between rounded-[5px] border border-[#DAD2BC] px-4 py-3">
              <div>
                <p className="font-medium text-[#252323]">{tt.course} — {tt.group}</p>
                <p className="text-sm text-[#A99985]">{tt.date} · {tt.time}</p>
              </div>
              <div className="flex -space-x-1.5">
                {tt.players.map((name, i) => {
                  const p = PLAYERS.find(pl => pl.name === name)
                  return (
                    <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${p?.color || 'bg-[#70798C]'}`} title={name}>
                      {p?.initials || name.slice(0, 2)}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <p className="text-sm text-[#A99985]">+ 2 more tee times — see the Golf tab</p>
        </div>
      </div>
    </div>
  )
}

// ─── Tee Times Tab ────────────────────────────────────────────────────────────

function DemoTeeTimes() {
  const grouped = TEE_TIMES.reduce((acc, tt) => {
    if (!acc[tt.date]) acc[tt.date] = []
    acc[tt.date].push(tt)
    return acc
  }, {} as Record<string, typeof TEE_TIMES>)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-2xl font-bold text-[#252323]">Tee Times</h2>
        <p className="text-[#A99985]">2 rounds · Pinehurst No. 2 & No. 4</p>
      </div>

      {Object.entries(grouped).map(([date, times]) => (
        <div key={date}>
          <h3 className="mb-3 text-lg font-bold text-[#252323]">{date}</h3>
          <div className="space-y-3">
            {times.map((tt) => (
              <div key={tt.id} className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold text-[#252323]">{tt.course}</p>
                    <p className="text-sm text-[#A99985]">{tt.group} · {tt.time}</p>
                  </div>
                  <span className="rounded-full bg-[#4A7C59]/10 px-3 py-1 text-xs font-semibold text-[#4A7C59] border border-[#4A7C59]/20">
                    Confirmed
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tt.players.map((name) => {
                    const p = PLAYERS.find(pl => pl.name === name)
                    return (
                      <div key={name} className="flex items-center gap-2 rounded-full border border-[#DAD2BC] px-3 py-1">
                        <div className={`h-5 w-5 rounded-full ${p?.color || 'bg-[#70798C]'} flex items-center justify-center`}>
                          <span className="text-[9px] font-bold text-white">{p?.initials}</span>
                        </div>
                        <span className="text-sm text-[#252323]">{name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Scorecard */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-[#252323]">Scorecard — Pinehurst No. 2 (Round 2, Front 9)</h3>
        <div className="overflow-x-auto rounded-[8px] border border-[#DAD2BC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DAD2BC] bg-[#F5F1ED]">
                <th className="px-4 py-3 text-left font-semibold text-[#252323]">Player</th>
                {PAR.map((_, i) => (
                  <th key={i} className="px-3 py-3 text-center font-semibold text-[#252323]">{i + 1}</th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-[#252323]">Total</th>
                <th className="px-4 py-3 text-center font-semibold text-[#252323]">+/-</th>
              </tr>
              <tr className="border-b border-[#DAD2BC]">
                <td className="px-4 py-2 text-xs font-medium text-[#A99985]">Par</td>
                {PAR.map((p, i) => (
                  <td key={i} className="px-3 py-2 text-center text-xs font-medium text-[#A99985]">{p}</td>
                ))}
                <td className="px-4 py-2 text-center text-xs font-medium text-[#A99985]">{PAR.reduce((a, b) => a + b, 0)}</td>
                <td className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {SCORECARD.map((row, ri) => {
                const total = row.scores.reduce((a, b) => a + b, 0)
                const parTotal = PAR.reduce((a, b) => a + b, 0)
                const diff = total - parTotal
                return (
                  <tr key={ri} className={`border-b border-[#F5F1ED] ${ri % 2 === 0 ? '' : 'bg-[#F5F1ED]/40'}`}>
                    <td className="px-4 py-2.5 font-medium text-[#252323]">{row.player}</td>
                    {row.scores.map((s, si) => (
                      <td key={si} className={`px-3 py-2.5 text-center text-xs ${scoreColor(s, PAR[si])}`}>{s}</td>
                    ))}
                    <td className="px-4 py-2.5 text-center font-semibold text-[#252323]">{total}</td>
                    <td className={`px-4 py-2.5 text-center font-semibold text-sm ${diff < 0 ? 'text-red-600' : diff === 0 ? 'text-[#4A7C59]' : 'text-[#70798C]'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[#A99985]">Scores from Round 2 · Pinehurst No. 2 · Front 9 only shown</p>
      </div>
    </div>
  )
}

// ─── Itinerary Tab ────────────────────────────────────────────────────────────

function DemoItinerary() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#252323]">Itinerary</h2>
        <p className="text-[#A99985]">Day-by-day schedule for Pinehurst Boys Trip</p>
      </div>

      <div className="space-y-8">
        {ITINERARY.map((day) => (
          <div key={day.date}>
            <h3 className="mb-4 text-xl font-bold text-[#252323]">{day.date}</h3>
            <div className="space-y-3">
              {day.items.map((item, i) => (
                <div key={i} className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#252323]">{item.title}</p>
                      <div className="mt-1 space-y-0.5 text-sm text-[#A99985]">
                        <p>🕐 {item.time}</p>
                        <p>📍 {item.location}</p>
                      </div>
                    </div>
                  </div>
                  {item.description && (
                    <p className="mt-3 text-sm text-[#70798C]">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────

function DemoExpenses() {
  const total = EXPENSES.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#252323]">Expenses</h2>
        <p className="text-[#A99985]">All costs split equally across 8 players</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense list */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-[#252323]">All Expenses</h3>
          <div className="space-y-3">
            {EXPENSES.map((expense) => (
              <div key={expense.id} className="rounded-[8px] border border-[#DAD2BC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-[#252323]">{expense.description}</p>
                    <p className="mt-0.5 text-xs text-[#A99985]">Paid by {expense.paidBy} · Split equally</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#252323]">${expense.amount.toLocaleString()}</p>
                    <p className="text-xs text-[#A99985]">${expense.perPerson}/person</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[8px] border border-[#DAD2BC] bg-[#F5F1ED] p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#252323]">Trip Total</p>
              <p className="font-bold text-[#252323]">${total.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-[#A99985]">Per person (equal split)</p>
              <p className="text-lg font-bold text-[#4A7C59]">${TOTAL_PER_PERSON}</p>
            </div>
          </div>
        </div>

        {/* Balance sheet */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-[#252323]">Who Owes What</h3>
          <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="mb-4 text-sm text-[#A99985]">Each player owes <span className="font-semibold text-[#252323]">${TOTAL_PER_PERSON}</span> total. Settle up with whoever paid each expense.</p>
            <div className="space-y-2">
              {EXPENSES.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between rounded-[5px] bg-[#F5F1ED] px-3 py-2">
                  <span className="text-sm text-[#252323]">→ {expense.paidBy}</span>
                  <span className="text-sm font-medium text-[#252323]">${expense.perPerson}/person</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#DAD2BC]/60 px-3 py-1 text-xs text-[#70798C]">Venmo</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#DAD2BC]/60 px-3 py-1 text-xs text-[#70798C]">Zelle</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#DAD2BC]/60 px-3 py-1 text-xs text-[#70798C]">Cash App</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoTripPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-[1200px] px-6 py-6">

        {/* Header */}
        <div className="mb-3 rounded-[8px] border border-[#DAD2BC] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <button
                onClick={() => router.push('/trips')}
                className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[#A99985] transition-colors hover:text-[#252323]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                My Trips
              </button>

              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#252323] sm:text-2xl">
                  Pinehurst Boys Trip
                </h1>
                <span className="inline-flex items-center rounded-full border border-[#70798C]/20 bg-[#70798C]/10 px-2.5 py-0.5 text-xs font-semibold text-[#70798C]">
                  Demo Trip
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#A99985]">
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Pinehurst, NC
                </span>
                <span>May 14 – May 17, 2025 (4 days)</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#4A7C59]/20 bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs font-semibold text-[#4A7C59]">
                  confirmed
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#252323] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a3737]"
              >
                Create Your Own Trip →
              </Link>
            </div>
          </div>
        </div>

        {/* People Bar */}
        <div className="mb-6 rounded-[8px] border border-[#DAD2BC] bg-white px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {PLAYERS.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white ${p.color}`}
                    title={p.name}
                  >
                    <span className="text-[10px] font-semibold text-white">{p.initials}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#A99985]">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4A7C59]" />
                  8 going
                </span>
              </div>
            </div>
            <div className="text-xs text-[#4A7C59]">✓ Everyone has responded</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="sticky top-0 z-20 mb-6 bg-white rounded-[8px] px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <TabsTrigger value="overview">
              <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teeTimes">
              <Trophy className="mr-1.5 h-3.5 w-3.5" />
              Golf & Scores
            </TabsTrigger>
            <TabsTrigger value="itinerary">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="expenses">
              <Receipt className="mr-1.5 h-3.5 w-3.5" />
              Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><DemoOverview /></TabsContent>
          <TabsContent value="teeTimes"><DemoTeeTimes /></TabsContent>
          <TabsContent value="itinerary"><DemoItinerary /></TabsContent>
          <TabsContent value="expenses"><DemoExpenses /></TabsContent>
        </Tabs>

        {/* Sticky CTA banner */}
        <div className="mt-10 rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
          <p className="text-lg font-bold text-[#252323]">Ready to plan your own trip?</p>
          <p className="mt-1 text-sm text-[#A99985]">Sign up free and start organizing tee times, expenses, and your crew in minutes.</p>
          <Link
            href="/signup"
            className="mt-4 inline-flex items-center gap-2 rounded-[5px] bg-[#252323] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a3737]"
          >
            Create Your Own Trip →
          </Link>
        </div>
      </div>
    </div>
  )
}
