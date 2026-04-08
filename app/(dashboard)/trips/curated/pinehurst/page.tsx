'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DAYS = [
  {
    day: 1,
    label: 'Day 1',
    theme: 'Arrival + Warm-Up',
    items: [
      { time: '3:00 PM', icon: '🏨', title: 'Arrive & Check In', sub: 'Carolina Hotel or Holly Inn · Pinehurst Resort' },
      { time: '4:30 PM', icon: '⛳', title: 'Warm-Up Round — No. 3 or No. 5', sub: 'Forgiving greens, great intro to Pinehurst' },
      { time: '6:30 PM', icon: '🎵', title: 'The Cradle (Par-3 Short Course)', sub: 'Music · Drinks · Closest-to-pin games' },
      { time: '8:00 PM', icon: '🍽️', title: 'Dinner — The Deuce', sub: 'Overlooks 18th of No. 2 · Casual but iconic' },
    ],
  },
  {
    day: 2,
    label: 'Day 2',
    theme: 'Championship Day',
    items: [
      { time: '8:00 AM', icon: '🏆', title: 'Pinehurst No. 2 — The Bucket List Round', sub: 'Donald Ross design · Turtleback greens · Caddie recommended' },
      { time: '1:00 PM', icon: '🥪', title: 'Lunch at the Clubhouse', sub: 'Halfway house or main clubhouse' },
      { time: '2:30 PM', icon: '⛳', title: 'Afternoon Round — No. 4 (Optional)', sub: 'Elite modern course if the crew has legs left' },
      { time: '7:00 PM', icon: '🍝', title: 'Dinner — Villaggio Ristorante', sub: 'Best Italian in the area · Great group dinner spot' },
      { time: '9:00 PM', icon: '🍺', title: 'Village Bar Hop', sub: 'Drum & Quill → Dugan\'s Pub · Settle the bets' },
    ],
  },
  {
    day: 3,
    label: 'Day 3',
    theme: 'Competitive + Fun',
    items: [
      { time: '8:00 AM', icon: '🎯', title: 'Morning Round — Off-Property', sub: 'Tobacco Road · Mid Pines · Pine Needles — crew\'s call' },
      { time: '2:00 PM', icon: '😎', title: 'Afternoon Free Time', sub: 'Replay 9 · Pool · Putting green · Decompress' },
      { time: '6:30 PM', icon: '🍻', title: 'Final Dinner — Pinehurst Brewing Co.', sub: 'Craft beer + casual vibe · Final night stories' },
    ],
  },
  {
    day: 4,
    label: 'Day 4',
    theme: 'Departure',
    items: [
      { time: '9:00 AM', icon: '☕', title: 'Breakfast & Check Out', sub: 'Optional quick 9 or putting green before heading out' },
      { time: '11:00 AM', icon: '🚗', title: 'Head Out', sub: '~2 hrs to Charlotte · Already planning the next one' },
    ],
  },
]

const ACCOMMODATION_OPTIONS = [
  {
    name: 'Pinehurst Resort',
    type: 'The Full Experience',
    description: 'Carolina Hotel or Holly Inn. Stay on-property for seamless tee time access and the full resort vibe.',
    priceRange: '$300–$600/night',
    bookingUrl: 'https://www.pinehurst.com/stay/',
    icon: '🏩',
    badge: 'Recommended',
  },
  {
    name: 'Group Rental House',
    type: 'Best for Large Groups',
    description: 'Rent a house near the Village of Pinehurst. More space, a kitchen, and usually cheaper split across the crew.',
    priceRange: '$250–$500/night total',
    bookingUrl: 'https://www.vrbo.com/search?destination=Pinehurst%2C+NC',
    icon: '🏡',
    badge: null,
  },
  {
    name: 'Mid Pines Inn',
    type: 'Classic Golf Hotel',
    description: 'Right on the Mid Pines course. A classic, understated golf hotel with a great bar and included breakfast.',
    priceRange: '$200–$450/night',
    bookingUrl: 'https://www.pineneedlesmidpines.com/mid-pines-inn',
    icon: '🏌️',
    badge: null,
  },
]

const BASE_PER_PERSON = {
  lodging: 900,   // 3 nights
  no2: 500,
  otherRounds: 400,
  food: 300,
  misc: 100,
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PinehurstCuratedPage() {
  const router = useRouter()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Default to 60 days out
  const defaultStart = new Date(today)
  defaultStart.setDate(today.getDate() + 60)
  const defaultEnd = new Date(defaultStart)
  defaultEnd.setDate(defaultStart.getDate() + 3)

  const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0])
  const [guests, setGuests] = useState(4)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPerPerson = Object.values(BASE_PER_PERSON).reduce((a, b) => a + b, 0)
  const totalTrip = totalPerPerson * guests

  function handleStartDateChange(val: string) {
    setStartDate(val)
    // Auto-set end date to start + 3 nights
    if (val) {
      const s = new Date(val + 'T00:00:00')
      s.setDate(s.getDate() + 3)
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
          template: 'pinehurst',
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
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1500932334442-8761ee4810a7?w=1400&q=85&fit=crop"
          alt="Pinehurst aerial view"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(28,26,23,0.3) 0%, rgba(28,26,23,0.65) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 40px' }}>
          <Link href="/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(245,241,237,0.7)', textDecoration: 'none', marginBottom: 16, letterSpacing: '0.03em' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="7.5,2 3.5,6 7.5,10"/></svg>
            Back to trips
          </Link>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.55)', marginBottom: 8, fontWeight: 400 }}>Curated Golf Package</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 300, color: '#F5F1ED', lineHeight: 1.05, margin: 0 }}>
            Pinehurst No. 2<br /><em style={{ fontStyle: 'italic' }}>& Beyond</em>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(245,241,237,0.7)', marginTop: 10 }}>
            3 nights · 3–4 rounds · Southern Pines, NC
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

        {/* LEFT: Itinerary + Accommodation */}
        <div>

          {/* Itinerary */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 6 }}>The Itinerary</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: '#1C1A17', margin: '0 0 24px' }}>
              4 days. Every moment planned.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {DAYS.map((day) => (
                <div key={day.day} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(28,26,23,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 300, color: '#1C1A17' }}>{day.label}</span>
                      <span style={{ width: 1, height: 14, background: 'rgba(28,26,23,0.15)' }} />
                      <span style={{ fontSize: 12, color: '#6B6460' }}>{day.theme}</span>
                    </div>
                    {startDate && (
                      <span style={{ fontSize: 11, color: '#A09890' }}>
                        {formatDate(new Date(new Date(startDate + 'T00:00:00').setDate(new Date(startDate + 'T00:00:00').getDate() + day.day - 1)).toISOString().split('T')[0])}
                      </span>
                    )}
                  </div>
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
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 6 }}>Where to Stay</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: '#1C1A17', margin: '0 0 6px' }}>
              Accommodation options
            </h2>
            <p style={{ fontSize: 13, color: '#6B6460', marginBottom: 20 }}>
              Pricing varies by dates and availability. Links open the booking site with Pinehurst pre-filled.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ACCOMMODATION_OPTIONS.map((option) => (
                <div key={option.name} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{option.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1A17' }}>{option.name}</span>
                      {option.badge && (
                        <span style={{ fontSize: 10, letterSpacing: '0.06em', background: '#EAF3DE', color: '#3B6D11', padding: '2px 8px', borderRadius: 10 }}>{option.badge}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: '#A09890', marginBottom: 4, letterSpacing: '0.04em' }}>{option.type}</p>
                    <p style={{ fontSize: 13, color: '#6B6460', lineHeight: 1.55, margin: '0 0 10px' }}>{option.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#1C1A17', fontWeight: 500 }}>{option.priceRange}</span>
                      <a
                        href={option.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#70798C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, letterSpacing: '0.03em' }}
                      >
                        Check availability
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8L8 2M8 2H4M8 2V6"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#A09890', marginTop: 12, lineHeight: 1.6 }}>
              💡 Pro tip: Pinehurst Resort packages often include stay + golf rounds together. Check for resort packages before booking separately — it can save $200+/person.
            </p>
          </div>
        </div>

        {/* RIGHT: Sticky Plan Panel */}
        <div style={{ position: 'sticky', top: 24 }}>

          {/* Date + Guest Picker */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: 24, marginBottom: 16 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 16 }}>Plan your trip</p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6B6460', marginBottom: 5, letterSpacing: '0.04em' }}>ARRIVAL DATE</label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleStartDateChange(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '0.5px solid rgba(28,26,23,0.18)', borderRadius: 5, fontSize: 13, color: '#1C1A17', background: '#F5F1ED', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6B6460', marginBottom: 5, letterSpacing: '0.04em' }}>DEPARTURE DATE</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '0.5px solid rgba(28,26,23,0.18)', borderRadius: 5, fontSize: 13, color: '#1C1A17', background: '#F5F1ED', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6B6460', marginBottom: 5, letterSpacing: '0.04em' }}>PLAYERS</label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                style={{ width: '100%', padding: '9px 12px', border: '0.5px solid rgba(28,26,23,0.18)', borderRadius: 5, fontSize: 13, color: '#1C1A17', background: '#F5F1ED', outline: 'none', fontFamily: 'inherit' }}
              >
                {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>{n} players</option>
                ))}
              </select>
            </div>

            {/* Budget Estimate */}
            <div style={{ background: '#F5F1ED', borderRadius: 6, padding: '16px', marginBottom: 20 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 4 }}>Estimated per person</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 44, fontWeight: 300, color: '#1C1A17', lineHeight: 1, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                ${totalPerPerson.toLocaleString()}
              </p>
              <p style={{ fontSize: 11, color: '#A09890' }}>${totalTrip.toLocaleString()} total for {guests} players</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {[
                ['Lodging (3 nights)', BASE_PER_PERSON.lodging],
                ['Golf — No. 2', BASE_PER_PERSON.no2],
                ['Golf — Other rounds', BASE_PER_PERSON.otherRounds],
                ['Food & Drinks', BASE_PER_PERSON.food],
                ['Misc', BASE_PER_PERSON.misc],
              ].map(([label, amount]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderTop: '0.5px solid rgba(28,26,23,0.07)' }}>
                  <span style={{ color: '#6B6460' }}>{label}</span>
                  <span style={{ color: '#1C1A17', fontWeight: 500 }}>${(amount as number).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#8B4444', background: '#FEF2F2', padding: '8px 12px', borderRadius: 5, marginBottom: 12 }}>{error}</p>
            )}

            <button
              onClick={handleBuildTrip}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#8C8680' : '#1C1A17',
                color: '#F5F1ED',
                border: 'none',
                borderRadius: 5,
                padding: '13px',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.07em',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Building your trip...' : 'Build This Trip →'}
            </button>

            <p style={{ fontSize: 11, color: '#A09890', textAlign: 'center', marginTop: 10 }}>
              Full itinerary pre-loaded. Edit anything after.
            </p>
          </div>

          {/* What's included */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#1C1A17', marginBottom: 14 }}>What gets pre-built</p>
            {[
              '14 itinerary items across 4 days',
              'Budget categories with estimates',
              'Golf — No. 2 as your anchor round',
              'Dinner & nightlife recommendations',
              'Shareable invite link for your crew',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3B6D11" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="2,7 5.5,10.5 12,3.5"/></svg>
                <span style={{ fontSize: 12, color: '#6B6460' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @media (max-width: 760px) {
          .curated-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
