'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TeeTimeList } from '@/components/golf/TeeTimeList'
import { EquipmentCoordination } from '@/components/golf/EquipmentCoordination'
import { Leaderboard } from '@/components/golf/Leaderboard'
import { GroupMaker } from '@/components/golf/GroupMaker'
import { GolfBets } from '@/components/golf/GolfBets'
import { CourseRatings } from '@/components/golf/CourseRatings'

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div>
        <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: '2px' }}>
          {sublabel}
        </p>
        <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          {label}
        </h2>
      </div>
      <div style={{ flex: 1, height: '0.5px', background: 'rgba(28,26,23,0.12)' }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GolfPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [roundBanner, setRoundBanner] = useState<string | null>(null) // course name after scores saved

  return (
    <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: '6px' }}>
              Golf Planner
            </p>
            <h1 style={{ fontSize: '26px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              ⛳ On the Course
            </h1>
          </div>
          <Button variant="outline" onClick={() => router.back()} style={{ fontSize: '12px' }}>
            ← Back to Trip
          </Button>
        </div>

        {/* Golf Profile — collapsed by default */}
        <div className="mb-8">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#70798C',
              fontWeight: 500,
              letterSpacing: '0.04em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            {profileOpen ? 'Hide golf profile' : 'Edit golf profile'}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <div
              style={{
                marginTop: '12px',
                background: '#fff',
                border: '0.5px solid rgba(28,26,23,0.10)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <EquipmentCoordination tripId={tripId} />
            </div>
          )}
        </div>

        {/* ── BEFORE THE ROUND ─────────────────────────────────────── */}
        <div className="space-y-6 mb-10">
          <SectionHeader label="Before the Round" sublabel="Prepare" />

          {/* Group Maker — full width */}
          <div
            style={{
              background: '#fff',
              border: '0.5px solid rgba(28,26,23,0.10)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1C1A17', marginBottom: '2px' }}>Group Maker</h3>
              <p style={{ fontSize: '12px', color: '#A09890' }}>Assign foursomes by skill level</p>
            </div>
            <GroupMaker tripId={tripId} />
          </div>

          {/* Tee Times + Set Bets */}
          <div className="grid gap-6 md:grid-cols-2">
            <div
              style={{
                background: '#fff',
                border: '0.5px solid rgba(28,26,23,0.10)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <TeeTimeList tripId={tripId} />
            </div>

            <div
              style={{
                background: '#fff',
                border: '0.5px solid rgba(28,26,23,0.10)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1C1A17', marginBottom: '2px' }}>Set Bets</h3>
                <p style={{ fontSize: '12px', color: '#A09890' }}>Low gross, skins, Nassau and more</p>
              </div>
              <GolfBets tripId={tripId} />
            </div>
          </div>
        </div>

        {/* ── DURING THE ROUND ─────────────────────────────────────── */}
        <div className="space-y-6 mb-10">
          <SectionHeader label="During the Round" sublabel="Play" />

          {/* Trip linking banner — appears after scores are saved */}
          {roundBanner && (
            <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.12)', borderRadius: '8px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1A17', marginBottom: '2px' }}>
                  Scores saved for {roundBanner}
                </p>
                <p style={{ fontSize: '12px', color: '#6B6460' }}>
                  Want to log this round in your season competition?
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Link
                  href="/my-group"
                  style={{ background: '#1C1A17', color: '#F5F1ED', borderRadius: '5px', padding: '8px 16px', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  Log Match →
                </Link>
                <button
                  onClick={() => setRoundBanner(null)}
                  style={{ background: 'none', border: 'none', color: '#A09890', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Enter Scores — prominent, lives in TeeTimeList */}
            <div
              style={{
                background: '#1C1A17',
                border: 'none',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.45)', marginBottom: '8px' }}>
                Enter Scores
              </p>
              <p style={{ fontSize: '20px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '4px' }}>
                How's everyone doing?
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(245,241,237,0.50)', marginBottom: '20px' }}>
                Select a round below to enter scores
              </p>
              <TeeTimeList tripId={tripId} scoreOnly onScoresSaved={(course) => setRoundBanner(course)} />
            </div>

            {/* Leaderboard */}
            <div
              style={{
                background: '#fff',
                border: '0.5px solid rgba(28,26,23,0.10)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1C1A17', marginBottom: '2px' }}>Live Leaderboard</h3>
                <p style={{ fontSize: '12px', color: '#A09890' }}>Scores from all rounds</p>
              </div>
              <Leaderboard tripId={tripId} />
            </div>
          </div>
        </div>

        {/* ── AFTER THE ROUND ──────────────────────────────────────── */}
        <div className="space-y-6">
          <SectionHeader label="After the Round" sublabel="Wrap Up" />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Settle Bets */}
            <div
              style={{
                background: '#fff',
                border: '0.5px solid rgba(28,26,23,0.10)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1C1A17', marginBottom: '2px' }}>Settle Bets</h3>
                <p style={{ fontSize: '12px', color: '#A09890' }}>Declare winners and add to expenses</p>
              </div>
              <GolfBets tripId={tripId} settleOnly />
            </div>

            {/* Rate Course */}
            <div
              style={{
                background: '#fff',
                border: '0.5px solid rgba(28,26,23,0.10)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1C1A17', marginBottom: '2px' }}>Rate the Course</h3>
                <p style={{ fontSize: '12px', color: '#A09890' }}>How did it play? Help your group remember</p>
              </div>
              <CourseRatings tripId={tripId} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
