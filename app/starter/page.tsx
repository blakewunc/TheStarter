import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Starter — Golf Trip Planner for Your Crew',
  description: 'Plan your golf trip with your crew. Tee times, scorecards, expense splitting, group availability, and full itineraries — everything your golf crew needs in one place.',
  keywords: ['golf trip planner', 'golf group planner', 'tee time planner', 'golf scorecard app', 'golf trip organizer', 'golf vacation planner'],
  openGraph: {
    title: 'The Starter — Golf Trip Planner for Your Crew',
    description: 'Tee times, scorecards, and expense splitting for your golf crew. Plan your next trip in minutes.',
    type: 'website',
    siteName: 'The Starter',
  },
  twitter: {
    card: 'summary',
    title: 'The Starter — Golf Trip Planner',
    description: 'Tee times, scorecards, and expense splitting for your golf crew.',
  },
}

export default function StarterLanding() {
  return (
    <div style={{ background: '#0d1f2d' }} className="flex min-h-screen flex-col">
      {/* Hero */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        {/* Eyebrow */}
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#70798C' }} className="mb-6 uppercase">
          The Starter — Golf Trip Planner
        </p>

        {/* H1 */}
        <h1
          style={{ fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: 400, color: '#F5F1ED', lineHeight: 1.1, fontFamily: 'Georgia, "Times New Roman", serif' }}
          className="mb-6"
        >
          Golf trips, handled.
        </h1>

        {/* Subhead */}
        <p
          style={{ fontSize: '16px', color: '#8fa3b1', lineHeight: 1.6, maxWidth: '480px' }}
          className="mb-10"
        >
          You book the tee times. We handle everything else — costs, scorecards, bets, and the 12 group texts you were about to send.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            style={{ background: '#2a5c3f', color: '#F5F1ED', padding: '12px 28px', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }}
            className="transition-opacity hover:opacity-90"
          >
            Plan your trip — it&apos;s free
          </Link>
          <Link
            href="/trips/demo"
            style={{ background: 'transparent', color: '#8fa3b1', border: '1px solid #1a3347', padding: '12px 28px', borderRadius: '6px', fontSize: '14px' }}
            className="transition-colors hover:border-[#2a5c3f] hover:text-[#F5F1ED]"
          >
            See a demo trip
          </Link>
        </div>

        {/* Proof line */}
        <p style={{ fontSize: '12px', color: '#4a6070', marginTop: '28px' }}>
          Free to start · No credit card · Works for groups of 4–20
        </p>
      </main>

      {/* Feature bar — flush below hero, same dark bg */}
      <div style={{ background: '#0d1f2d', borderTop: '1px solid #1a3347' }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Tee times',
                desc: 'Schedule rounds, assign foursomes, keep everyone on the same sheet',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8fa3b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
              },
              {
                title: 'Live scoring',
                desc: 'Scores, handicap adjustments, and leaderboard — updated in real time',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8fa3b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
              },
              {
                title: 'Cost splitting',
                desc: 'Green fees, lodging, dinners — no more Venmo math or awkward asks',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8fa3b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                ),
              },
              {
                title: 'Nassau & skins',
                desc: 'Set stakes, track bets, calculate payouts at the 19th hole',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8fa3b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                style={{
                  padding: '24px 28px',
                  borderRight: i < 3 ? '1px solid #1a3347' : undefined,
                  borderBottom: i < 2 ? '1px solid #1a3347' : undefined,
                }}
                className="lg:[border-bottom:none]"
              >
                <div
                  style={{ width: '32px', height: '32px', background: '#1a3347', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  className="mb-3"
                >
                  {feature.icon}
                </div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#F5F1ED', marginBottom: '6px' }}>
                  {feature.title}
                </p>
                <p style={{ fontSize: '12px', color: '#4a6070', lineHeight: 1.5 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
