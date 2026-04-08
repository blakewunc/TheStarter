'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TIMELINE = [
  {
    window: '6–12 months out',
    urgency: 'critical',
    label: 'Book your resort stay',
    detail: 'Call Pebble Beach Resorts and book The Lodge or Inn at Spanish Bay first. Without a confirmed stay, you cannot guarantee a Pebble tee time. Give them flexible date ranges to increase availability.',
    icon: '🏨',
  },
  {
    window: 'Immediately after',
    urgency: 'critical',
    label: 'Request Pebble tee time',
    detail: 'Call the resort and request Pebble Beach Golf Links tied to your stay. Ask for morning (best weather, less wind). Request a backup afternoon slot. They will confirm when inventory opens.',
    icon: '📞',
  },
  {
    window: '3–6 months out',
    urgency: 'high',
    label: 'Confirm tee times + book flights',
    detail: 'Tee times get confirmed in this window. Lock your schedule: Day 2 Pebble, Day 3 Spyglass, Day 4 flexible. Book flights into Monterey (MRY) or San Jose (SJC). Rent a car.',
    icon: '✅',
  },
  {
    window: '2–3 months out',
    urgency: 'medium',
    label: 'Dinners + caddies',
    detail: 'Reserve Stillwater Bar & Grill (fills fast for groups 4+). Request caddies for Pebble — required, not optional. Optional caddie for Spyglass too. Book Roy\'s and Tap Room.',
    icon: '🍽️',
  },
  {
    window: '2–4 weeks out',
    urgency: 'medium',
    label: 'Reconfirm everything',
    detail: 'Call the resort and confirm tee times, caddie assignments, room details. This is where small upgrades happen — ask for better tee slots if anything opened up.',
    icon: '📋',
  },
  {
    window: '3–5 days out',
    urgency: 'low',
    label: 'Check weather + adjust',
    detail: 'Wind at Pebble drastically changes the experience. Morning tee times are more protected. Call and try to shift slightly if a storm window is forecast.',
    icon: '🌊',
  },
  {
    window: 'Arrival day',
    urgency: 'low',
    label: 'Talk to the concierge',
    detail: 'Check in early and ask about earlier tee times, replay opportunities, and caddie recommendations. Pebble has last-minute movement — locals use this.',
    icon: '🎯',
  },
]

const DAYS = [
  {
    day: 1,
    label: 'Day 1',
    theme: 'Arrival + Settle In',
    items: [
      { time: '3:00 PM', icon: '🏨', title: 'Arrive & Check In', sub: 'The Lodge at Pebble Beach or The Inn at Spanish Bay' },
      { time: '5:00 PM', icon: '🌊', title: 'Walk the Property', sub: 'Bluff walk, 18th fairway, let it sink in' },
      { time: '6:30 PM', icon: '🥂', title: 'Drinks — The Bench', sub: 'Casual opener with ocean views' },
      { time: '7:30 PM', icon: '🍽️', title: 'Dinner — Stillwater Bar & Grill', sub: 'Overlooks 18th at Pebble · Iconic first night · Book early' },
    ],
  },
  {
    day: 2,
    label: 'Day 2',
    theme: 'Main Event — Pebble Beach',
    highlight: true,
    items: [
      { time: '8:00 AM', icon: '🏆', title: 'Pebble Beach Golf Links', sub: 'The round. Take a caddie — non-negotiable. Holes 4–10 will blow your mind.' },
      { time: '1:30 PM', icon: '🥪', title: 'Lunch + Relive It', sub: 'Clubhouse. Don\'t rush. This round deserves 30 minutes of recap.' },
      { time: '3:30 PM', icon: '🧖', title: 'Relax — Spa / Pool / Putting Green', sub: 'Your body will thank you tomorrow for Spyglass' },
      { time: '7:00 PM', icon: '🍱', title: 'Dinner — Roy\'s at Pebble Beach', sub: 'Hawaiian fusion · Great post-round dinner · Excellent cocktails' },
    ],
  },
  {
    day: 3,
    label: 'Day 3',
    theme: 'Spyglass + Spanish Bay Sunset',
    items: [
      { time: '8:00 AM', icon: '⛳', title: 'Spyglass Hill Golf Course', sub: 'Harder than Pebble · Coastal + forest mix · Stunning and punishing' },
      { time: '2:00 PM', icon: '🚗', title: '17-Mile Drive', sub: 'Lone Cypress · Ghost Tree · Stop, get out, take photos' },
      { time: '5:30 PM', icon: '🎵', title: 'Bagpiper Sunset at Spanish Bay', sub: 'Must-do. Fire pits, drinks, a bagpiper on the 18th at sunset. Unreal.' },
      { time: '7:30 PM', icon: '🥩', title: 'Dinner — The Tap Room', sub: 'Classic steakhouse vibe · Great after a competitive day' },
    ],
  },
  {
    day: 4,
    label: 'Day 4',
    theme: 'Flexible Round + Carmel',
    items: [
      { time: '8:00 AM', icon: '🎯', title: 'Morning Round — Your Call', sub: 'Spanish Bay (links, windy) · Pacific Grove ("poor man\'s Pebble") · Pasatiempo (MacKenzie design)' },
      { time: '2:00 PM', icon: '🛍️', title: 'Carmel-by-the-Sea', sub: 'Walk the village · Beach · Drinks · Decompress after 3 rounds' },
      { time: '7:00 PM', icon: '🚲', title: 'Final Dinner — La Bicyclette', sub: 'Best group dinner in the area · More local, less resort · Perfect close to the trip' },
    ],
  },
  {
    day: 5,
    label: 'Day 5',
    theme: 'Departure',
    items: [
      { time: '9:00 AM', icon: '☕', title: 'Breakfast Overlooking the Ocean', sub: 'Optional putting green session before heading out' },
      { time: '11:00 AM', icon: '🚗', title: 'Head Out', sub: 'Monterey (MRY) or San Jose (SJC) · Already planning the next one' },
    ],
  },
]

const ACCOMMODATION = [
  {
    name: 'The Lodge at Pebble Beach',
    type: 'Best Access',
    description: 'Directly on the 18th hole of Pebble. Staying here is your strongest position for securing a Pebble tee time. The rooms overlooking the 18th are worth every dollar.',
    priceRange: '$1,000–$2,000/night',
    bookingUrl: 'https://www.pebblebeach.com/accommodations/the-lodge-at-pebble-beach/',
    icon: '🏰',
    badge: 'Best for Tee Times',
  },
  {
    name: 'The Inn at Spanish Bay',
    type: 'Great Vibe',
    description: 'Slightly more relaxed vibe with easier availability. Still on-property so you get tee time access. Right next to the Spanish Bay bagpiper sunset — which is a top 5 moment of the trip.',
    priceRange: '$800–$1,500/night',
    bookingUrl: 'https://www.pebblebeach.com/accommodations/the-inn-at-spanish-bay/',
    icon: '🌅',
    badge: null,
  },
  {
    name: 'Casa Palmero',
    type: 'Most Exclusive',
    description: '24-suite boutique hotel within the Pebble Beach property. Private, intimate, and exceptionally well-staffed. Best for smaller groups (4 or fewer).',
    priceRange: '$1,200–$2,500/night',
    bookingUrl: 'https://www.pebblebeach.com/accommodations/casa-palmero/',
    icon: '🏡',
    badge: null,
  },
]

const BASE_PER_PERSON = {
  lodging: 2500,
  pebble: 625,
  spyglass: 450,
  day4: 350,
  food: 800,
  misc: 300,
}

const URGENCY_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  critical: { bg: '#FEF2F2', dot: '#DC2626', text: '#991B1B' },
  high:     { bg: '#FFF7ED', dot: '#EA580C', text: '#9A3412' },
  medium:   { bg: '#FFFBEB', dot: '#D97706', text: '#92400E' },
  low:      { bg: '#F0FDF4', dot: '#16A34A', text: '#14532D' },
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PebbleBeachCuratedPage() {
  const router = useRouter()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const defaultStart = new Date(today)
  defaultStart.setDate(today.getDate() + 180) // 6 months out default
  const defaultEnd = new Date(defaultStart)
  defaultEnd.setDate(defaultStart.getDate() + 4)

  const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0])
  const [guests, setGuests] = useState(4)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timelineOpen, setTimelineOpen] = useState(true)

  const totalPerPerson = Object.values(BASE_PER_PERSON).reduce((a, b) => a + b, 0)
  const totalTrip = totalPerPerson * guests

  // Months until trip
  const monthsOut = startDate
    ? Math.round((new Date(startDate + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0

  const bookingStatus =
    monthsOut >= 6 ? { label: '✓ Great timing for Pebble', color: '#3B6D11', bg: '#EAF3DE' }
    : monthsOut >= 3 ? { label: '⚠ Tight — call resort now', color: '#92400E', bg: '#FFF7ED' }
    : { label: '⚡ Very tight — act immediately', color: '#991B1B', bg: '#FEF2F2' }

  function handleStartDateChange(val: string) {
    setStartDate(val)
    if (val) {
      const s = new Date(val + 'T00:00:00')
      s.setDate(s.getDate() + 4)
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
          template: 'pebble-beach',
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
          src="https://images.unsplash.com/photo-1635328800844-0e68e80ab258?w=1400&q=85&fit=crop"
          alt="Pebble Beach Golf Links along the California coast"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(28,26,23,0.2) 0%, rgba(28,26,23,0.7) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 40px' }}>
          <Link href="/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(245,241,237,0.7)', textDecoration: 'none', marginBottom: 16, letterSpacing: '0.03em' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="7.5,2 3.5,6 7.5,10"/></svg>
            Back to trips
          </Link>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.55)', marginBottom: 8 }}>Curated Golf Package · Premium</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 300, color: '#F5F1ED', lineHeight: 1.05, margin: 0 }}>
            Pebble Beach<br /><em style={{ fontStyle: 'italic' }}>& Monterey Peninsula</em>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(245,241,237,0.7)', marginTop: 10 }}>
            4 nights · 3 core rounds + 1 optional · Pebble Beach, CA
          </p>
        </div>
      </div>

      {/* Booking window alert */}
      <div style={{ background: '#1C1A17', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ fontSize: 13, color: 'rgba(245,241,237,0.85)', lineHeight: 1.5 }}>
            Pebble Beach requires booking your <strong style={{ color: '#F5F1ED' }}>resort stay 6–12 months in advance</strong> to guarantee a tee time. This isn't optional.
          </span>
        </div>
        <button
          onClick={() => setTimelineOpen(true)}
          style={{ fontSize: 11, color: '#F5F1ED', background: 'transparent', border: '0.5px solid rgba(245,241,237,0.3)', borderRadius: 5, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
        >
          See booking timeline →
        </button>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Booking Timeline (collapsible) */}
        {timelineOpen && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: 28, marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 4 }}>Booking Playbook</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 300, color: '#1C1A17', margin: 0 }}>
                  This is where Pebble trips are won or lost
                </h2>
              </div>
              <button onClick={() => setTimelineOpen(false)} style={{ fontSize: 12, color: '#A09890', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>Hide ↑</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIMELINE.map((step, idx) => {
                const s = URGENCY_STYLES[step.urgency]
                return (
                  <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Left: index + connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.dot, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      {idx < TIMELINE.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 16, background: 'rgba(28,26,23,0.10)', margin: '4px 0' }} />
                      )}
                    </div>
                    {/* Right: content */}
                    <div style={{ flex: 1, background: s.bg, borderRadius: 6, padding: '12px 14px', marginBottom: idx < TIMELINE.length - 1 ? 0 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 16 }}>{step.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1A17' }}>{step.label}</span>
                        <span style={{ fontSize: 10, color: s.text, background: '#fff', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.04em' }}>{step.window}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6B6460', lineHeight: 1.6, margin: 0 }}>{step.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 16, padding: '12px 14px', background: '#F5F1ED', borderRadius: 6, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: 12, color: '#6B6460', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#1C1A17' }}>Backup strategy:</strong> If you missed the window, even booking 1 night at the resort gets you access to the tee sheet. Also call and ask about the 24-hour public window — it's competitive, but openings happen for smaller groups.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

          {/* LEFT */}
          <div>

            {/* Itinerary */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 6 }}>The Itinerary</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: '#1C1A17', margin: '0 0 24px' }}>
                5 days. Every moment matters.
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {DAYS.map((day) => (
                  <div
                    key={day.day}
                    style={{
                      background: '#fff',
                      border: (day as any).highlight ? '0.5px solid #1C1A17' : '0.5px solid rgba(28,26,23,0.10)',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(28,26,23,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: (day as any).highlight ? '#1C1A17' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 300, color: (day as any).highlight ? '#F5F1ED' : '#1C1A17' }}>{day.label}</span>
                        <span style={{ width: 1, height: 14, background: (day as any).highlight ? 'rgba(245,241,237,0.2)' : 'rgba(28,26,23,0.15)' }} />
                        <span style={{ fontSize: 12, color: (day as any).highlight ? 'rgba(245,241,237,0.7)' : '#6B6460' }}>{day.theme}</span>
                        {(day as any).highlight && (
                          <span style={{ fontSize: 10, background: '#F5F1ED', color: '#1C1A17', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.05em' }}>Main Event</span>
                        )}
                      </div>
                      {startDate && (
                        <span style={{ fontSize: 11, color: (day as any).highlight ? 'rgba(245,241,237,0.5)' : '#A09890' }}>
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
                Stay on-property. Non-negotiable.
              </h2>
              <p style={{ fontSize: 13, color: '#6B6460', marginBottom: 20 }}>
                To guarantee a Pebble tee time, you must stay at one of the three Pebble Beach Resort properties. Off-property guests compete in a very tight 24-hour public window.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ACCOMMODATION.map((option) => (
                  <div key={option.name} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: 8, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{option.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1A17' }}>{option.name}</span>
                        {option.badge && (
                          <span style={{ fontSize: 10, letterSpacing: '0.06em', background: '#EAF3DE', color: '#3B6D11', padding: '2px 8px', borderRadius: 10 }}>{option.badge}</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: '#A09890', marginBottom: 6, letterSpacing: '0.04em' }}>{option.type}</p>
                      <p style={{ fontSize: 13, color: '#6B6460', lineHeight: 1.55, margin: '0 0 10px' }}>{option.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#1C1A17', fontWeight: 500 }}>{option.priceRange}</span>
                        <a
                          href={option.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, color: '#70798C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, letterSpacing: '0.03em' }}
                        >
                          Book directly with resort
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

              {/* Booking status */}
              {startDate && (
                <div style={{ background: bookingStatus.bg, borderRadius: 5, padding: '8px 12px', marginBottom: 16, fontSize: 12, color: bookingStatus.color, fontWeight: 500 }}>
                  {bookingStatus.label}
                  {monthsOut > 0 && <span style={{ fontWeight: 400, color: bookingStatus.color, opacity: 0.8 }}> ({monthsOut} months out)</span>}
                </div>
              )}

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
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} players</option>
                  ))}
                </select>
              </div>

              {/* Budget estimate */}
              <div style={{ background: '#F5F1ED', borderRadius: 6, padding: '16px', marginBottom: 20 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: 4 }}>Estimated per person</p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 44, fontWeight: 300, color: '#1C1A17', lineHeight: 1, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                  ${totalPerPerson.toLocaleString()}
                </p>
                <p style={{ fontSize: 11, color: '#A09890' }}>${totalTrip.toLocaleString()} total for {guests} players</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
                {[
                  ['Lodging (4 nights)', BASE_PER_PERSON.lodging],
                  ['Golf — Pebble Beach', BASE_PER_PERSON.pebble],
                  ['Golf — Spyglass Hill', BASE_PER_PERSON.spyglass],
                  ['Golf — Day 4 round', BASE_PER_PERSON.day4],
                  ['Food & Drinks', BASE_PER_PERSON.food],
                  ['Misc', BASE_PER_PERSON.misc],
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

              <button
                onClick={handleBuildTrip}
                disabled={loading}
                style={{ width: '100%', background: loading ? '#8C8680' : '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: 5, padding: '13px', fontSize: 12, fontWeight: 500, letterSpacing: '0.07em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s' }}
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
                '17 itinerary items across 5 days',
                'Budget with lodging, 3 rounds + caddies',
                'Pebble Beach as Day 2 anchor',
                'Spyglass + flexible Day 4 round',
                'Bagpiper sunset at Spanish Bay',
                'Full booking timeline in the trip notes',
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
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>
    </div>
  )
}
