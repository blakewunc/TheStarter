'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const COURSES = [
  {
    name: 'Old Course, St Andrews',
    type: 'Ballot — Aspirational',
    certainty: 'ballot',
    description: 'The most famous course in golf. Accessible via a daily ballot (~20% odds per entry). The itinerary builds in multiple ballot days to maximize your chances — but it is never guaranteed.',
    fee: '~£245 (~$310)',
    notes: 'Caddie required. Non-negotiable. If you\'re here, you commit to the caddie.',
    icon: '🏆',
  },
  {
    name: 'Carnoustie Championship Links',
    type: 'Guaranteed Booking',
    certainty: 'guaranteed',
    description: 'The anchor of the trip. The hardest course you\'ll play. Championship Links — four Open Championships. Barry Burn on 18 is one of the most famous closing holes in golf.',
    fee: '~£215 (~$270)',
    notes: '45-min drive from St Andrews. Book direct at carnoustiegolflinks.co.uk',
    icon: '⚔️',
  },
  {
    name: 'Kingsbarns Golf Links',
    type: 'Guaranteed Booking',
    certainty: 'guaranteed',
    description: 'Premium bookable links. Ocean views on nearly every hole. If the Old Course ballot fails, Kingsbarns is not a consolation — it\'s a destination in its own right.',
    fee: '~£235 (~$295)',
    notes: 'Book 3–6 months ahead at kingsbarns.com',
    icon: '🌊',
  },
  {
    name: 'Dumbarnie Links',
    type: 'Guaranteed Booking',
    certainty: 'guaranteed',
    description: 'The newest links on the Fife coast (2020). Modern, accessible, spectacular views across the Firth of Forth. Great warm-up course and genuinely excellent on its own terms.',
    fee: '~£175 (~$220)',
    notes: 'Easiest booking of the five courses. dumbarnielinks.com',
    icon: '🌬️',
  },
  {
    name: 'St Andrews New Course',
    type: 'Guaranteed Booking',
    certainty: 'guaranteed',
    description: 'On the same links complex as the Old Course. Just as historic, much more accessible. Superb backup or primary round — don\'t sleep on it.',
    fee: '~£130 (~$165)',
    notes: 'Book through St Andrews Links Trust (standrews.com)',
    icon: '⛳',
  },
]

const BALLOT_STEPS = [
  {
    step: 'Online ballot (2 days prior)',
    detail: 'Open at standrews.com — submit 2 days before your target round. Results notified the evening before. You can enter once per day per person.',
    icon: '💻',
  },
  {
    step: 'Physical daily ballot (morning of)',
    detail: 'Show up to the Starter\'s Box before 8am. Physical ballot for single tee times. Better odds for smaller groups (1–2 players). Pairs and fourballs can split.',
    icon: '🏃',
  },
  {
    step: 'Stay multiple days in St Andrews',
    detail: 'Each day adds an online ballot entry. The itinerary is built with 5 possible ballot days (Days 1–5). Cumulative probability of success improves significantly with each entry.',
    icon: '📅',
  },
  {
    step: 'Kingsbarns is the backup — not a failure',
    detail: 'Kingsbarns is genuinely world-class. If the ballot doesn\'t come through, the day is not lost. Frame it this way to your crew before departure.',
    icon: '✅',
  },
]

const DAYS = [
  {
    day: 1,
    label: 'Day 1',
    theme: 'Arrive Edinburgh → St Andrews',
    ballotDay: true,
    items: [
      { time: '12:00 PM', icon: '✈️', title: 'Fly into Edinburgh (EDI)', sub: 'Pick up rental car — you\'ll need it all week' },
      { time: '2:00 PM', icon: '🚗', title: 'Transfer to St Andrews (~1.5 hrs)', sub: 'Through Fife. First views of the town stop you cold.' },
      { time: '4:00 PM', icon: '🚶', title: 'Walk the Town + Old Course', sub: 'West Sands beach · Swilcan Bridge · It\'s free to walk' },
      { time: '5:00 PM', icon: '🎯', title: 'Enter Old Course Ballot (Day 3)', sub: 'Submit online at standrews.com for first attempt' },
      { time: '7:30 PM', icon: '🦞', title: 'Dinner — The Seafood Ristorante', sub: 'Best restaurant in St Andrews · Book ahead' },
    ],
  },
  {
    day: 2,
    label: 'Day 2',
    theme: 'Warm-Up Round',
    ballotDay: true,
    items: [
      { time: '8:30 AM', icon: '⛳', title: 'Round 1 — New Course or Dumbarnie Links', sub: 'Ease in. New Course is historic, Dumbarnie is modern + spectacular.' },
      { time: '2:00 PM', icon: '🏋️', title: 'Afternoon — Range + Recovery', sub: 'Get used to links turf. Walk the Old Course again.' },
      { time: '5:00 PM', icon: '🎯', title: 'Enter Ballot (Day 4 attempt)', sub: 'Second entry. Odds compound.' },
      { time: '7:00 PM', icon: '🍺', title: 'Pub Night — The Dunvegan / Ma Bells', sub: 'Classic St Andrews pubs. Settle into the trip.' },
    ],
  },
  {
    day: 3,
    label: 'Day 3',
    theme: 'Old Course Attempt Day',
    ballotFork: true,
    items: [],
    fork: {
      success: {
        label: 'Ballot success',
        color: '#3B6D11',
        bg: '#EAF3DE',
        items: [
          { time: '7:00 AM', icon: '🏆', title: 'Play the Old Course', sub: 'The round. Take a caddie — it\'s non-negotiable here.' },
          { time: '1:00 PM', icon: '🥃', title: 'Lunch + Replay Every Hole', sub: 'The clubhouse. You\'ll be doing this anyway.' },
        ],
      },
      backup: {
        label: 'Ballot miss → Kingsbarns',
        color: '#1C1A17',
        bg: '#F5F1ED',
        items: [
          { time: '8:30 AM', icon: '🌊', title: 'Play Kingsbarns Golf Links', sub: 'World-class. Ocean on nearly every hole. Not a consolation.' },
          { time: '2:00 PM', icon: '🎯', title: 'Enter Ballot for Day 5', sub: 'Still in it. Keep trying.' },
        ],
      },
    },
  },
  {
    day: 4,
    label: 'Day 4',
    theme: 'Premium Round + East Neuk',
    ballotDay: true,
    items: [
      { time: '8:30 AM', icon: '⛳', title: 'Round 3 — Kingsbarns or Dumbarnie', sub: 'Kingsbarns if not played Day 3. Dumbarnie if you\'ve done both.' },
      { time: '2:00 PM', icon: '🌊', title: 'East Neuk of Fife', sub: 'Crail · Anstruther (best fish & chips in Scotland) · Pittenweem harbour' },
      { time: '5:00 PM', icon: '🎯', title: 'Enter Ballot (Day 6 attempt)', sub: 'Final primary ballot entry.' },
      { time: '7:30 PM', icon: '🍽️', title: 'Dinner — The Peat Inn (20 min drive)', sub: 'Michelin-star. Worth the drive. Book way ahead.' },
    ],
  },
  {
    day: 5,
    label: 'Day 5',
    theme: 'Carnoustie Day Trip',
    items: [
      { time: '7:30 AM', icon: '🚗', title: 'Drive to Carnoustie (45 mins)', sub: 'Cross the Tay Bridge. Good morning drive.' },
      { time: '8:30 AM', icon: '⚔️', title: 'Play Carnoustie Championship Links', sub: 'The hardest course of the trip. Barry Burn on 18 is iconic. Embrace the suffering.' },
      { time: '2:00 PM', icon: '🐟', title: 'Lunch in Arbroath', sub: 'Arbroath smokie — proper smoked haddock. Essential.' },
      { time: '7:00 PM', icon: '🍽️', title: 'Dinner — The Criterion', sub: 'Classic St Andrews spot. Good group meal.' },
    ],
  },
  {
    day: 6,
    label: 'Day 6',
    theme: 'Final Old Course Attempt',
    ballotFork: true,
    items: [],
    fork: {
      success: {
        label: 'Old Course (ballot or replay)',
        color: '#3B6D11',
        bg: '#EAF3DE',
        items: [
          { time: '8:00 AM', icon: '🏆', title: 'Play the Old Course', sub: 'First or second time. Still unbelievable.' },
        ],
      },
      backup: {
        label: 'Ballot miss → Jubilee or replay',
        color: '#1C1A17',
        bg: '#F5F1ED',
        items: [
          { time: '8:00 AM', icon: '⛳', title: 'Replay Favorite or Play Jubilee Course', sub: 'Jubilee Course is excellent and underrated. Replay whatever was best.' },
        ],
      },
    },
  },
  {
    day: 7,
    label: 'Day 7',
    theme: 'Town Day + Drive to Edinburgh',
    items: [
      { time: '9:00 AM', icon: '🛍️', title: 'Golf Shops + Cathedral Ruins', sub: 'Old Tom Morris shop · British Golf Museum · Cathedral is free to walk' },
      { time: '11:00 AM', icon: '⛳', title: 'Optional: Eden Course or Putting Green', sub: 'Relaxed, cheap, fun. Good final 9 before heading out.' },
      { time: '2:00 PM', icon: '🚗', title: 'Drive to Edinburgh', sub: '~1.5 hrs. Check in near the airport.' },
      { time: '7:00 PM', icon: '🥃', title: 'Final Night — Edinburgh Old Town', sub: 'Royal Mile · Grassmarket · Proper end to the trip.' },
    ],
  },
  {
    day: 8,
    label: 'Day 8',
    theme: 'Departure',
    items: [
      { time: '6:00 AM', icon: '✈️', title: 'Fly Home', sub: 'Edinburgh Airport (EDI) · Already looking up ballot dates for next year.' },
    ],
  },
]

const ACCOMMODATION = [
  {
    name: 'Old Course Hotel',
    type: 'Premium · On the Links',
    description: 'Overlooking the Road Hole (17th) of the Old Course. The best address in St Andrews. Staying here gives you proximity advantage for the daily ballot.',
    priceRange: '£350–£800/night',
    bookingUrl: 'https://www.oldcoursehotel.co.uk/',
    icon: '🏰',
    badge: 'Best Location',
  },
  {
    name: 'Rusacks Hotel',
    type: 'Premium · 18th Hole Views',
    description: 'Perched on the edge of the 18th fairway. The terrace bar overlooking the Old Course finishing hole is one of the great views in golf. Great for groups.',
    priceRange: '£250–$600/night',
    bookingUrl: 'https://www.marriott.com/hotels/travel/edisy-rusacks-st-andrews/',
    icon: '🌅',
    badge: null,
  },
  {
    name: 'Self-Catering Cottage (Group)',
    type: 'Best Value for Groups',
    description: 'Rent a house in or near St Andrews for the week. More space, a kitchen for breakfasts, and often significantly cheaper split across 4–8 players.',
    priceRange: '£1,500–£4,000/week total',
    bookingUrl: 'https://www.visitscotland.com/accommodation/self-catering/?locationId=3',
    icon: '🏡',
    badge: null,
  },
]

const BASE_PER_PERSON = {
  flights: 1200,
  lodging: 1750,
  oldCourse: 310,
  carnoustie: 270,
  kingsbarns: 295,
  other: 385, // Dumbarnie + New Course
  food: 700,
  transport: 300,
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function ScottishPilgrimagePage() {
  const router = useRouter()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const defaultStart = new Date(today)
  defaultStart.setDate(today.getDate() + 270) // ~9 months out default
  const defaultEnd = new Date(defaultStart)
  defaultEnd.setDate(defaultStart.getDate() + 7)

  const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0])
  const [guests, setGuests] = useState(4)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ballotOpen, setBallotOpen] = useState(true)

  const totalPerPerson = Object.values(BASE_PER_PERSON).reduce((a, b) => a + b, 0)
  const totalTrip = totalPerPerson * guests

  function handleStartDateChange(val: string) {
    setStartDate(val)
    if (val) {
      const s = new Date(val + 'T00:00:00')
      s.setDate(s.getDate() + 7)
      setEndDate(s.toISOString().split('T')[0])
    }
  }

  async function handleBuildTrip() {
    if (!startDate || !endDate) {
      setError('Please select your trip dates')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/trips/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'scottish-pilgrimage',
          start_date: startDate,
          end_date: endDate,
          expected_guests: guests,
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create trip')
      }
      const { trip } = await response.json()
      router.push(`/trips/${trip.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F1ED', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1672871583040-42826d4e9ca4?w=1400&q=85&fit=crop"
          alt="Scottish links golf course at sunset with coastal cliffs"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 50%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(28,26,23,0.25) 0%, rgba(28,26,23,0.75) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 40px' }}>
          <Link href="/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(245,241,237,0.7)', textDecoration: 'none', marginBottom: 16, letterSpacing: '0.03em' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="7.5,2 3.5,6 7.5,10"/></svg>
            Back to trips
          </Link>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.55)', marginBottom: 8 }}>Curated Golf Package · International</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 300, color: '#F5F1ED', lineHeight: 1.05, margin: 0 }}>
            Scottish Links<br /><em style={{ fontStyle: 'italic' }}>Pilgrimage</em>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(245,241,237,0.7)', marginTop: 10 }}>
            7 nights · 5 rounds · St Andrews, Kingsbarns, Carnoustie + Dumbarnie
          </p>
        </div>
      </div>

      {/* Old Course reality banner */}
      <div style={{ background: '#1C1A17', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <span style={{ fontSize: 13, color: 'rgba(245,241,237,0.85)', lineHeight: 1.5 }}>
            Old Course access is <strong style={{ color: '#F5F1ED' }}>ballot-based (~20% odds per entry)</strong>. This itinerary is built around maximizing your chances — with Kingsbarns as the world-class backup.
          </span>
        </div>
        <button
          onClick={() => setBallotOpen(true)}
          style={{ fontSize: 11, color: '#F5F1ED', background: 'transparent', border: '0.5px solid rgba(245,241,237,0.3)', borderRadius: 5, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
        >
          How the ballot works →
        </button>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Ballot Explained */}
        {ballotOpen && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: 28, marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 4 }}>The Old Course Reality Check</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 300, color: '#1C1A17', margin: 0 }}>
                  The Old Course is a ballot, not a booking
                </h2>
                <p style={{ fontSize: 13, color: '#6B6460', marginTop: 6 }}>
                  This itinerary gives you the best possible odds — with a world-class backup so no day is wasted regardless.
                </p>
              </div>
              <button onClick={() => setBallotOpen(false)} style={{ fontSize: 12, color: '#A09890', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>Hide ↑</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {BALLOT_STEPS.map((s, idx) => (
                <div key={idx} style={{ background: '#F5F1ED', borderRadius: 6, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1C1A17', margin: '0 0 4px' }}>{s.step}</p>
                    <p style={{ fontSize: 12, color: '#6B6460', margin: 0, lineHeight: 1.6 }}>{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 14px', background: '#EAF3DE', borderRadius: 6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>📊</span>
              <p style={{ fontSize: 12, color: '#3B6D11', margin: 0, lineHeight: 1.6 }}>
                <strong>Probability math:</strong> With 5 ballot entries over 5 days, cumulative odds of playing the Old Course at least once reach roughly 65–70%. The itinerary gives you maximum attempts. Kingsbarns is pre-booked as your anchor backup.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

          {/* LEFT */}
          <div>

            {/* Course Lineup */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 6 }}>The Courses</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: '#1C1A17', margin: '0 0 20px' }}>
                Five rounds. All legitimate.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {COURSES.map((course) => (
                  <div key={course.name} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{course.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1A17' }}>{course.name}</span>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 10,
                          letterSpacing: '0.05em',
                          background: course.certainty === 'ballot' ? '#FEF2F2' : '#EAF3DE',
                          color: course.certainty === 'ballot' ? '#991B1B' : '#3B6D11',
                        }}>
                          {course.type}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#6B6460', margin: '0 0 6px', lineHeight: 1.55 }}>{course.description}</p>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#1C1A17', fontWeight: 500 }}>{course.fee}</span>
                        <span style={{ fontSize: 11, color: '#A09890' }}>{course.notes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 6 }}>The Itinerary</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: '#1C1A17', margin: '0 0 24px' }}>
                8 days. Built around the ballot.
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {DAYS.map((day) => (
                  <div key={day.day} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(28,26,23,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 300, color: '#1C1A17' }}>{day.label}</span>
                        <span style={{ width: 1, height: 14, background: 'rgba(28,26,23,0.15)' }} />
                        <span style={{ fontSize: 12, color: '#6B6460' }}>{day.theme}</span>
                        {(day as any).ballotDay && (
                          <span style={{ fontSize: 10, background: '#FEF2F2', color: '#991B1B', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.04em' }}>Ballot day</span>
                        )}
                        {(day as any).ballotFork && (
                          <span style={{ fontSize: 10, background: '#FFF7ED', color: '#92400E', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.04em' }}>Two outcomes</span>
                        )}
                      </div>
                      {startDate && (
                        <span style={{ fontSize: 11, color: '#A09890' }}>
                          {formatDate(addDays(startDate, day.day - 1))}
                        </span>
                      )}
                    </div>

                    {/* Fork days */}
                    {(day as any).ballotFork ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        {/* Success */}
                        <div style={{ borderRight: '0.5px solid rgba(28,26,23,0.07)', padding: '14px 16px', background: (day as any).fork.success.bg }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: (day as any).fork.success.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: (day as any).fork.success.color }}>{(day as any).fork.success.label}</span>
                          </div>
                          {(day as any).fork.success.items.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 500, color: '#1C1A17', margin: '0 0 2px' }}>{item.title}</p>
                                <p style={{ fontSize: 11, color: '#6B6460', margin: 0, lineHeight: 1.5 }}>{item.sub}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Backup */}
                        <div style={{ padding: '14px 16px', background: (day as any).fork.backup.bg }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: (day as any).fork.backup.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: (day as any).fork.backup.color }}>{(day as any).fork.backup.label}</span>
                          </div>
                          {(day as any).fork.backup.items.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 500, color: '#1C1A17', margin: '0 0 2px' }}>{item.title}</p>
                                <p style={{ fontSize: 11, color: '#6B6460', margin: 0, lineHeight: 1.5 }}>{item.sub}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {day.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 20px', borderBottom: idx < day.items.length - 1 ? '0.5px solid rgba(28,26,23,0.05)' : 'none' }}>
                            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1A17' }}>{item.title}</span>
                                <span style={{ fontSize: 11, color: '#A09890' }}>{item.time}</span>
                              </div>
                              <p style={{ fontSize: 12, color: '#6B6460', margin: '2px 0 0', lineHeight: 1.5 }}>{item.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodation */}
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 6 }}>Where to Stay</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: '#1C1A17', margin: '0 0 20px' }}>
                Stay in St Andrews all week.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ACCOMMODATION.map((opt) => (
                  <div key={opt.name} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: '18px 20px', display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1A17' }}>{opt.name}</span>
                        {opt.badge && <span style={{ fontSize: 10, background: '#EAF3DE', color: '#3B6D11', padding: '2px 8px', borderRadius: 10 }}>{opt.badge}</span>}
                      </div>
                      <p style={{ fontSize: 11, color: '#A09890', marginBottom: 6, letterSpacing: '0.04em' }}>{opt.type}</p>
                      <p style={{ fontSize: 13, color: '#6B6460', margin: '0 0 10px', lineHeight: 1.55 }}>{opt.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1A17' }}>{opt.priceRange}</span>
                        <a href={opt.bookingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#70798C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          Check availability
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8L8 2M8 2H4M8 2V6"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky panel */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: 24, marginBottom: 16 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 16 }}>Plan your trip</p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6B6460', marginBottom: 5, letterSpacing: '0.04em' }}>ARRIVAL DATE</label>
                <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => handleStartDateChange(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '0.5px solid rgba(28,26,23,0.18)', borderRadius: 5, fontSize: 13, color: '#1C1A17', background: '#F5F1ED', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6B6460', marginBottom: 5, letterSpacing: '0.04em' }}>DEPARTURE DATE</label>
                <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '0.5px solid rgba(28,26,23,0.18)', borderRadius: 5, fontSize: 13, color: '#1C1A17', background: '#F5F1ED', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6B6460', marginBottom: 5, letterSpacing: '0.04em' }}>PLAYERS</label>
                <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', border: '0.5px solid rgba(28,26,23,0.18)', borderRadius: 5, fontSize: 13, color: '#1C1A17', background: '#F5F1ED', outline: 'none', fontFamily: 'inherit' }}>
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} players</option>)}
                </select>
              </div>

              <div style={{ background: '#F5F1ED', borderRadius: 6, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 4 }}>Estimated per person</p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 44, fontWeight: 300, color: '#1C1A17', lineHeight: 1, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                  ${totalPerPerson.toLocaleString()}
                </p>
                <p style={{ fontSize: 11, color: '#A09890' }}>${totalTrip.toLocaleString()} total for {guests} players</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                {[
                  ['Flights (transatlantic)', BASE_PER_PERSON.flights],
                  ['Lodging (7 nights)', BASE_PER_PERSON.lodging],
                  ['Golf — Old Course (if success)', BASE_PER_PERSON.oldCourse],
                  ['Golf — Carnoustie', BASE_PER_PERSON.carnoustie],
                  ['Golf — Kingsbarns', BASE_PER_PERSON.kingsbarns],
                  ['Golf — Dumbarnie + New Course', BASE_PER_PERSON.other],
                  ['Food & Drinks (7 days)', BASE_PER_PERSON.food],
                  ['Car + Transport', BASE_PER_PERSON.transport],
                ].map(([label, amount]) => (
                  <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderTop: '0.5px solid rgba(28,26,23,0.07)' }}>
                    <span style={{ color: '#6B6460' }}>{label}</span>
                    <span style={{ color: '#1C1A17', fontWeight: 500 }}>${(amount as number).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {error && (
                <p style={{ fontSize: 12, color: '#8B4444', background: '#FEF2F2', padding: '8px 12px', borderRadius: 5, marginBottom: 12 }}>{error}</p>
              )}

              <button onClick={handleBuildTrip} disabled={loading}
                style={{ width: '100%', background: loading ? '#8C8680' : '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: 5, padding: '13px', fontSize: 12, fontWeight: 500, letterSpacing: '0.07em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Building your trip...' : 'Build This Trip →'}
              </button>

              <p style={{ fontSize: 11, color: '#A09890', textAlign: 'center', marginTop: 10 }}>Full itinerary pre-loaded. Edit anything after.</p>
            </div>

            <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#1C1A17', marginBottom: 14 }}>What gets pre-built</p>
              {[
                '28 itinerary items across 8 days',
                '5 ballot entry reminders built in',
                'Old Course as aspirational anchor',
                'Kingsbarns as the guaranteed backup',
                'Carnoustie day trip with routing',
                'Dinner recs + pub nights',
                'Budget with flights + car rental',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3B6D11" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="2,7 5.5,10.5 12,3.5"/></svg>
                  <span style={{ fontSize: 12, color: '#6B6460' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>
    </div>
  )
}
