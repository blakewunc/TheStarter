'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile { id: string; display_name: string | null; email: string | null; handicap: number | null }
interface GroupMember { user_id: string; profiles: Profile | null }
interface Team { id: string; name: string; color: string; team_members: { user_id: string; profiles: Profile | null }[] }
interface MatchResult { winner: 'a' | 'b' | 'tie'; points_a: number; points_b: number }
interface MatchSide { side: 'a' | 'b'; user_id: string | null; team_id: string | null; profiles: Profile | null; competition_teams: { id: string; name: string } | null }
interface Match {
  id: string
  competition_id: string
  trip_id: string | null
  played_on: string
  course: string | null
  format: string
  status: string
  notes: string | null
  match_results: MatchResult[]
  match_sides: MatchSide[]
}
interface Competition {
  id: string
  name: string
  format: string
  season_year: number
  status: string
  competition_teams: Team[]
  matches: Match[]
}
interface Group {
  id: string
  name: string
  created_by: string
  group_members: GroupMember[]
  competitions: Competition[]
}
interface Reaction { id: string; emoji: string; user_id: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMOJI_MAP: Record<string, string> = { fire: '🔥', clap: '👏', skull: '💀', clown: '🤡' }
const FORMAT_LABELS: Record<string, string> = { nassau: 'Nassau', skins: 'Skins', wolf: 'Wolf', stroke_play: 'Stroke Play', '1v1': '1v1', '2v2': '2v2', scramble: 'Scramble' }

function memberName(p: Profile | null) {
  return p?.display_name || p?.email?.split('@')[0] || 'Unknown'
}

function fmtDate(d: string) {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function computeStandings(comp: Competition) {
  const teams = comp.competition_teams
  if (!teams || teams.length < 2) return null
  const pts: Record<string, number> = {}
  const wins: Record<string, number> = {}
  const losses: Record<string, number> = {}
  const draws: Record<string, number> = {}
  for (const t of teams) { pts[t.id] = 0; wins[t.id] = 0; losses[t.id] = 0; draws[t.id] = 0 }
  for (const m of comp.matches || []) {
    const r = m.match_results?.[0]
    if (!r) continue
    pts[teams[0].id] = (pts[teams[0].id] || 0) + (r.points_a || 0)
    pts[teams[1].id] = (pts[teams[1].id] || 0) + (r.points_b || 0)
    if (r.winner === 'a') { wins[teams[0].id]++; losses[teams[1].id]++ }
    else if (r.winner === 'b') { wins[teams[1].id]++; losses[teams[0].id]++ }
    else { draws[teams[0].id]++; draws[teams[1].id]++ }
  }
  return teams.map((t) => ({ team: t, points: pts[t.id] || 0, wins: wins[t.id] || 0, losses: losses[t.id] || 0, draws: draws[t.id] || 0 }))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyClub({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '340px' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontStyle: 'italic', color: '#B4B2A9', marginBottom: '16px' }}>
          No club yet. Your crew is waiting.
        </p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#888780', marginBottom: '24px', lineHeight: 1.6 }}>
          Create a club to track matches, manage a season, and see who&apos;s actually the best golfer in the group.
        </p>
        <button onClick={onCreate} style={btnDark}>Create your club</button>
      </div>
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const btnDark: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '9px 18px', background: '#2C2A26', color: '#F5F1ED',
  border: 'none', borderRadius: '6px', fontFamily: 'var(--sans)',
  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 14px', background: 'transparent', color: '#5F5E5A',
  border: '0.5px solid #D6CFC8', borderRadius: '6px', fontFamily: 'var(--sans)',
  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}
const card: React.CSSProperties = {
  background: '#fff', border: '0.5px solid #D6CFC8', borderRadius: '12px', overflow: 'hidden',
}
const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--sans)', fontSize: '10px', fontWeight: 500,
  letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888780',
}

// ─── Season Banner ────────────────────────────────────────────────────────────

function SeasonBanner({ comp }: { comp: Competition }) {
  const standings = computeStandings(comp)
  if (!standings || standings.length < 2) {
    return (
      <div style={{ background: '#2C2A26', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontStyle: 'italic', color: '#B4B2A9' }}>No season running. Start one and settle it properly.</p>
      </div>
    )
  }

  const [a, b] = standings
  const total = (a.points + b.points) || 1
  const aLeads = a.points > b.points
  const bLeads = b.points > a.points

  return (
    <div style={{ background: '#2C2A26', borderRadius: '12px', padding: '28px 32px' }}>
      {/* season label */}
      <p style={{ ...eyebrow, color: '#5F5E5A', marginBottom: '20px' }}>Season {comp.season_year} · {comp.matches?.length || 0} matches</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center' }}>
        {/* Team A */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.team.color || '#70798C' }} />
            {aLeads && <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: '#C0DD97', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Leading</span>}
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: '#F5F1ED', margin: '0 0 4px' }}>{a.team.name}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '48px', fontWeight: 300, color: '#F5F1ED', lineHeight: 1, margin: '0 0 6px' }}>{a.points}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#5F5E5A' }}>{a.wins}W · {a.draws}D · {a.losses}L</p>
        </div>

        {/* Center */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: '#5F5E5A', fontStyle: 'italic', margin: '0 0 16px' }}>vs</p>
          <div style={{ width: '80px', height: '4px', background: '#444441', borderRadius: '2px', overflow: 'hidden', margin: '0 auto 6px' }}>
            <div style={{ height: '100%', background: '#C0DD97', borderRadius: '2px', width: `${(a.points / total) * 100}%`, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: '10px', color: '#5F5E5A' }}>
            <span>{a.points}</span><span>{b.points}</span>
          </div>
        </div>

        {/* Team B */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', justifyContent: 'flex-end' }}>
            {bLeads && <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: '#C0DD97', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Leading</span>}
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.team.color || '#A99985' }} />
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: '#F5F1ED', margin: '0 0 4px' }}>{b.team.name}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '48px', fontWeight: 300, color: '#F5F1ED', lineHeight: 1, margin: '0 0 6px' }}>{b.points}</p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#5F5E5A' }}>{b.wins}W · {b.draws}D · {b.losses}L</p>
        </div>
      </div>
    </div>
  )
}

// ─── Match Row ────────────────────────────────────────────────────────────────

function MatchRow({
  match, currentUserId, groupId,
  reactions, onReactionToggle,
}: {
  match: Match
  currentUserId: string
  groupId: string
  reactions: Reaction[]
  onReactionToggle: (matchId: string, emoji: string) => void
}) {
  const result = match.match_results?.[0]
  const sideA = match.match_sides?.filter((s) => s.side === 'a') || []
  const sideB = match.match_sides?.filter((s) => s.side === 'b') || []

  const sideLabel = (sides: MatchSide[]) => {
    if (sides[0]?.competition_teams) return sides[0].competition_teams.name
    return sides.map((s) => memberName(s.profiles)).join(' & ')
  }

  const resultLabel = () => {
    if (!result) return null
    if (result.winner === 'tie') return { text: 'Draw', color: '#888780' }
    const winSide = result.winner === 'a' ? sideLabel(sideA) : sideLabel(sideB)
    return { text: `${winSide} win`, color: '#3B6D11' }
  }

  const res = resultLabel()

  // Group reactions by emoji
  const reactionGroups: Record<string, { count: number; mine: boolean }> = {}
  for (const r of reactions) {
    if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = { count: 0, mine: false }
    reactionGroups[r.emoji].count++
    if (r.user_id === currentUserId) reactionGroups[r.emoji].mine = true
  }

  return (
    <div style={{ padding: '16px 0', borderBottom: '0.5px solid #EAE6E1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Date + format */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#B4B2A9', flexShrink: 0 }}>{fmtDate(match.played_on)}</span>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', fontWeight: 500 }}>
              {FORMAT_LABELS[match.format] || match.format}{match.course ? ` · ${match.course}` : ''}
            </span>
          </div>
          {/* Teams */}
          {(sideA.length > 0 || sideB.length > 0) && (
            <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#888780', margin: '0 0 8px' }}>
              {sideLabel(sideA)} vs {sideLabel(sideB)}
            </p>
          )}
          {/* Reactions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {['fire', 'clap', 'skull', 'clown'].map((emoji) => {
              const g = reactionGroups[emoji]
              return (
                <button
                  key={emoji}
                  onClick={() => onReactionToggle(match.id, emoji)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    padding: '3px 8px', borderRadius: '12px',
                    background: g?.mine ? '#EAE6E1' : 'transparent',
                    border: '0.5px solid #EAE6E1',
                    fontFamily: 'var(--sans)', fontSize: '12px', color: '#5F5E5A',
                    cursor: 'pointer',
                  }}
                >
                  {EMOJI_MAP[emoji]}{g?.count ? ` ${g.count}` : ''}
                </button>
              )
            })}
          </div>
        </div>
        {/* Result */}
        {res && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: 600, color: res.color }}>
              {res.text}
            </span>
            {result && (
              <p style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: '#B4B2A9', margin: '2px 0 0' }}>
                {result.points_a} – {result.points_b}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Log Match Dialog ─────────────────────────────────────────────────────────

function LogMatchDialog({
  groupId, competition, onClose, onSaved,
}: {
  groupId: string
  competition: Competition | null
  onClose: () => void
  onSaved: () => void
}) {
  const [step, setStep] = useState(1)
  const [course, setCourse] = useState('')
  const [playedOn, setPlayedOn] = useState(new Date().toISOString().split('T')[0])
  const [format, setFormat] = useState('nassau')
  const [stakes, setStakes] = useState('')
  const [winner, setWinner] = useState<'a' | 'b' | 'tie'>('a')
  const [pointsA, setPointsA] = useState(1)
  const [pointsB, setPointsB] = useState(0)
  const [saving, setSaving] = useState(false)

  const teams = competition?.competition_teams || []
  const teamA = teams[0]
  const teamB = teams[1]

  const handleWinnerChange = (w: 'a' | 'b' | 'tie') => {
    setWinner(w)
    if (w === 'a') { setPointsA(1); setPointsB(0) }
    else if (w === 'b') { setPointsA(0); setPointsB(1) }
    else { setPointsA(0.5); setPointsB(0.5) }
  }

  const handleSave = async () => {
    if (!competition) { toast.error('No active season — create one first'); return }
    setSaving(true)
    try {
      const body: any = {
        competition_id: competition.id,
        played_on: playedOn,
        course: course.trim() || null,
        format,
        notes: stakes.trim() || null,
        winner,
        points_a: pointsA,
        points_b: pointsB,
      }
      if (teamA) body.side_a = { team_id: teamA.id }
      if (teamB) body.side_b = { team_id: teamB.id }

      const res = await fetch(`/api/groups/${groupId}/matches`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save match')
      toast.success('Match logged!')
      onSaved()
      onClose()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const formats = ['nassau', 'skins', 'wolf', 'stroke_play']

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(44,42,38,0.5)', zIndex: 100,
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  }
  const sheet: React.CSSProperties = {
    background: '#F5F1ED', borderRadius: '16px 16px 0 0', padding: '32px 24px 40px',
    width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <p style={{ ...eyebrow, marginBottom: '4px' }}>Step {step} of 2</p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: '#2C2A26', margin: 0 }}>
              {step === 1 ? 'Round details' : 'Result'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888780', fontSize: '20px' }}>×</button>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ ...eyebrow, display: 'block', marginBottom: '6px' }}>Course</label>
              <input
                value={course} onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Pinehurst No. 2"
                style={{ width: '100%', border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '14px', background: '#fff', color: '#2C2A26', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ ...eyebrow, display: 'block', marginBottom: '6px' }}>Date</label>
              <input
                type="date" value={playedOn} onChange={(e) => setPlayedOn(e.target.value)}
                style={{ width: '100%', border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '14px', background: '#fff', color: '#2C2A26', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ ...eyebrow, display: 'block', marginBottom: '8px' }}>Format</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formats.map((f) => (
                  <button
                    key={f} onClick={() => setFormat(f)}
                    style={{
                      padding: '7px 14px', borderRadius: '20px', fontFamily: 'var(--sans)', fontSize: '13px', cursor: 'pointer',
                      background: format === f ? '#2C2A26' : 'transparent',
                      color: format === f ? '#F5F1ED' : '#888780',
                      border: `0.5px solid ${format === f ? '#2C2A26' : '#D6CFC8'}`,
                    }}
                  >
                    {FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...eyebrow, display: 'block', marginBottom: '6px' }}>Stakes <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                value={stakes} onChange={(e) => setStakes(e.target.value)}
                placeholder="e.g. $10 per side"
                style={{ width: '100%', border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '14px', background: '#fff', color: '#2C2A26', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={() => setStep(2)} style={{ ...btnDark, width: '100%', justifyContent: 'center', marginTop: '8px' }}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ ...eyebrow, display: 'block', marginBottom: '12px' }}>Who won?</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { value: 'a' as const, label: teamA?.name || 'Side A' },
                  { value: 'tie' as const, label: 'Draw' },
                  { value: 'b' as const, label: teamB?.name || 'Side B' },
                ].map(({ value, label }) => (
                  <button
                    key={value} onClick={() => handleWinnerChange(value)}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: '8px', fontFamily: 'var(--sans)', fontSize: '13px', cursor: 'pointer', textAlign: 'center',
                      background: winner === value ? '#2C2A26' : '#fff',
                      color: winner === value ? '#F5F1ED' : '#888780',
                      border: `0.5px solid ${winner === value ? '#2C2A26' : '#D6CFC8'}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...eyebrow, display: 'block', marginBottom: '8px' }}>Points</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number" step="0.5" min="0" value={pointsA}
                  onChange={(e) => setPointsA(Number(e.target.value))}
                  style={{ border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '20px', textAlign: 'center', background: '#fff', color: '#2C2A26' }}
                />
                <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#888780', textAlign: 'center' }}>–</span>
                <input
                  type="number" step="0.5" min="0" value={pointsB}
                  onChange={(e) => setPointsB(Number(e.target.value))}
                  style={{ border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '20px', textAlign: 'center', background: '#fff', color: '#2C2A26' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', marginTop: '4px' }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#888780', textAlign: 'center' }}>{teamA?.name || 'Side A'}</p>
                <span />
                <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#888780', textAlign: 'center' }}>{teamB?.name || 'Side B'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setStep(1)} style={{ ...btnGhost, flex: '0 0 auto' }}>← Back</button>
              <button onClick={handleSave} disabled={saving} style={{ ...btnDark, flex: 1, justifyContent: 'center' }}>
                {saving ? 'Saving…' : 'Log match'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Create Group Dialog ──────────────────────────────────────────────────────

function CreateGroupDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (g: Group) => void }) {
  const [name, setName] = useState('')
  const [teamA, setTeamA] = useState('The Fliers')
  const [teamB, setTeamB] = useState('The Drifters')
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Give your club a name'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create club')
      const group = data.group

      // Create a default season with two teams
      const compRes = await fetch(`/api/groups/${group.id}/competitions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Season ${new Date().getFullYear()}`,
          format: 'ryder_cup',
          season_year: new Date().getFullYear(),
          teams: [
            { name: teamA.trim() || 'The Fliers', color: '#70798C' },
            { name: teamB.trim() || 'The Drifters', color: '#A99985' },
          ],
        }),
      })
      if (!compRes.ok) console.warn('Could not create default season')

      toast.success(`${name} created!`)
      onCreated(group)
      onClose()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(44,42,38,0.5)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  }
  const modal: React.CSSProperties = {
    background: '#F5F1ED', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '440px',
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <p style={{ ...eyebrow, marginBottom: '4px' }}>New club</p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: '#2C2A26', margin: 0 }}>Name your crew</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888780', fontSize: '20px' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ ...eyebrow, display: 'block', marginBottom: '6px' }}>Club name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Saturday Crew"
              style={{ width: '100%', border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: '14px', background: '#fff', color: '#2C2A26', boxSizing: 'border-box' }} />
          </div>
          <div style={{ borderTop: '0.5px solid #EAE6E1', paddingTop: '14px' }}>
            <p style={{ ...eyebrow, marginBottom: '10px' }}>Team names</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input value={teamA} onChange={(e) => setTeamA(e.target.value)} placeholder="Team A name"
                style={{ border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--sans)', fontSize: '13px', background: '#fff', color: '#2C2A26' }} />
              <input value={teamB} onChange={(e) => setTeamB(e.target.value)} placeholder="Team B name"
                style={{ border: '0.5px solid #D6CFC8', borderRadius: '8px', padding: '9px 12px', fontFamily: 'var(--sans)', fontSize: '13px', background: '#fff', color: '#2C2A26' }} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={saving} style={{ ...btnDark, justifyContent: 'center', marginTop: '8px' }}>
            {saving ? 'Creating…' : 'Create club'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Handicap Cell ────────────────────────────────────────────────────────────

function HandicapCell({ groupId, userId, initial, isOwn, isOrganizer }: {
  groupId: string; userId: string; initial: number | null; isOwn: boolean; isOrganizer: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initial !== null ? String(initial) : '')
  const [saving, setSaving] = useState(false)
  const canEdit = isOwn || isOrganizer

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/handicap`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, handicap: value === '' ? null : Number(value) }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      toast.success('Handicap updated')
      setEditing(false)
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          autoFocus type="number" value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          style={{ width: '56px', border: '0.5px solid #70798C', borderRadius: '4px', padding: '3px 6px', fontFamily: 'var(--sans)', fontSize: '13px', textAlign: 'center' }}
        />
        <button onClick={save} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B6D11', fontSize: '16px', padding: '2px' }}>✓</button>
        <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888780', fontSize: '14px', padding: '2px' }}>✕</button>
      </div>
    )
  }

  const missing = initial === null
  return (
    <button
      onClick={() => canEdit && setEditing(true)}
      style={{
        background: missing ? '#FAEEDA' : 'transparent',
        border: missing ? '0.5px solid #FAC775' : 'none',
        borderRadius: '4px', padding: missing ? '2px 8px' : '2px 0',
        fontFamily: 'var(--sans)', fontSize: '13px',
        color: missing ? '#854F0B' : '#2C2A26',
        cursor: canEdit ? 'pointer' : 'default',
      }}
    >
      {missing ? 'HCP —' : `+${initial}`}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyGroupPage() {
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({}) // matchId → reactions
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'season' | 'matches' | 'members'>('season')
  const [logMatchOpen, setLogMatchOpen] = useState(false)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [, setLoadingMatches] = useState(false)

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null
  const activeComp = competitions.find((c) => c.status === 'active') || competitions[0] || null
  const isOrganizer = !!(currentUserId && selectedGroup?.created_by === currentUserId)
  const allMatches = [...(activeComp?.matches || []), ...matches].filter(
    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
  ).sort((a, b) => b.played_on.localeCompare(a.played_on))

  // Load user + groups
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [, groupsRes] = await Promise.all([
          fetch('/api/auth/user').catch(() => null),
          fetch('/api/groups'),
        ])
        // Get current user from supabase client side
        const { createClient } = await import('@/lib/supabase/client')
        const sb = createClient()
        const { data: { user } } = await sb.auth.getUser()
        setCurrentUserId(user?.id || null)

        if (groupsRes.ok) {
          const data = await groupsRes.json()
          const g = data.groups || []
          setGroups(g)
          if (g.length > 0) setSelectedGroupId(g[0].id)
        }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  // Load competitions + matches when group changes
  const loadGroupData = useCallback(async (groupId: string) => {
    setLoadingMatches(true)
    try {
      const [compRes, matchRes] = await Promise.all([
        fetch(`/api/groups/${groupId}/competitions`),
        fetch(`/api/groups/${groupId}/matches`),
      ])
      if (compRes.ok) {
        const d = await compRes.json()
        setCompetitions(d.competitions || [])
      }
      if (matchRes.ok) {
        const d = await matchRes.json()
        setMatches(d.matches || [])
        // Load reactions for recent matches
        const recentMatches = (d.matches || []).slice(0, 10)
        const rxMap: Record<string, Reaction[]> = {}
        await Promise.all(
          recentMatches.map(async (m: Match) => {
            const r = await fetch(`/api/groups/${groupId}/matches/${m.id}/reactions`)
            if (r.ok) { const rd = await r.json(); rxMap[m.id] = rd.reactions || [] }
          })
        )
        setReactions(rxMap)
      }
    } finally { setLoadingMatches(false) }
  }, [])

  useEffect(() => {
    if (selectedGroupId) loadGroupData(selectedGroupId)
  }, [selectedGroupId, loadGroupData])

  const handleReactionToggle = async (matchId: string, emoji: string) => {
    if (!selectedGroupId || !currentUserId) return
    // Optimistic update
    const current = reactions[matchId] || []
    const existing = current.find((r) => r.emoji === emoji && r.user_id === currentUserId)
    if (existing) {
      setReactions((prev) => ({ ...prev, [matchId]: current.filter((r) => r.id !== existing.id) }))
    } else {
      setReactions((prev) => ({ ...prev, [matchId]: [...current, { id: 'tmp', emoji, user_id: currentUserId }] }))
    }
    // Sync to server
    await fetch(`/api/groups/${selectedGroupId}/matches/${matchId}/reactions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }),
    })
    // Re-fetch reactions for this match
    const r = await fetch(`/api/groups/${selectedGroupId}/matches/${matchId}/reactions`)
    if (r.ok) { const rd = await r.json(); setReactions((prev) => ({ ...prev, [matchId]: rd.reactions || [] })) }
  }

  const handleGroupCreated = (g: Group) => {
    setGroups((prev) => [g, ...prev])
    setSelectedGroupId(g.id)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F1ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#888780' }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F1ED' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 40px 80px' }}
           className="px-4 sm:px-6 lg:px-10">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ ...eyebrow, marginBottom: '6px' }}>The Club</p>
            {selectedGroup ? (
              <>
                <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 400, color: '#2C2A26', margin: '0 0 8px' }}>
                  {selectedGroup.name}
                </h1>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#888780', margin: 0 }}>
                  {selectedGroup.group_members?.length || 0} members
                  {activeComp && ` · Season ${activeComp.season_year}`}
                  {allMatches.length > 0 && ` · ${allMatches.length} matches played`}
                </p>
              </>
            ) : (
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 400, color: '#2C2A26', margin: 0 }}>
                Your club
              </h1>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, paddingTop: '8px' }}>
            <button onClick={() => setCreateGroupOpen(true)} style={btnGhost}>New club</button>
            <button
              onClick={() => {
                if (!selectedGroupId) return
                navigator.clipboard.writeText(`${window.location.origin}/invite/${selectedGroup?.competitions?.[0]?.id || ''}`)
                toast.success('Invite copied!')
              }}
              style={btnDark}
            >
              Invite member
            </button>
          </div>
        </div>

        {/* No group */}
        {!selectedGroup && !loading && (
          <EmptyClub onCreate={() => setCreateGroupOpen(true)} />
        )}

        {selectedGroup && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.5rem', alignItems: 'start' }}
               className="grid-cols-1 lg:grid-cols-[1fr_260px]">

            {/* Main content */}
            <div>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '0.5px solid #D6CFC8', marginBottom: '24px' }}>
                {(['season', 'matches', 'members'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: activeTab === tab ? 500 : 400,
                    color: activeTab === tab ? '#2C2A26' : '#888780',
                    background: 'none', border: 'none', padding: '0.85rem 0',
                    borderBottom: activeTab === tab ? '1.5px solid #2C2A26' : '1.5px solid transparent',
                    marginRight: '1.25rem', cursor: 'pointer', marginBottom: '-0.5px',
                    textTransform: 'capitalize',
                  }}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── Season Tab ── */}
              {activeTab === 'season' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Scoreboard */}
                  {activeComp && <SeasonBanner comp={activeComp} />}
                  {!activeComp && (
                    <div style={{ ...card, padding: '32px', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontStyle: 'italic', color: '#B4B2A9', marginBottom: '16px' }}>
                        No season running. Start one and settle it properly.
                      </p>
                    </div>
                  )}

                  {/* Start a round */}
                  <button onClick={() => setLogMatchOpen(true)} style={{ ...btnDark, width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px' }}>
                    Start a round
                  </button>

                  {/* Recent matches */}
                  <div style={{ ...card, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={eyebrow}>Recent matches</p>
                    </div>

                    {allMatches.length === 0 ? (
                      <div style={{ padding: '32px 0', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', color: '#B4B2A9', marginBottom: '16px' }}>
                          No matches logged. Someone has to go first.
                        </p>
                        <button onClick={() => setLogMatchOpen(true)} style={btnDark}>Log the first match</button>
                      </div>
                    ) : (
                      <>
                        {allMatches.slice(0, 5).map((m) => (
                          <MatchRow
                            key={m.id} match={m}
                            currentUserId={currentUserId || ''}
                            groupId={selectedGroupId!}
                            reactions={reactions[m.id] || []}
                            onReactionToggle={handleReactionToggle}
                          />
                        ))}
                        <button
                          onClick={() => setLogMatchOpen(true)}
                          style={{
                            display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center',
                            padding: '12px', marginTop: '8px', border: '1px dashed #D6CFC8', borderRadius: '8px',
                            background: 'transparent', fontFamily: 'var(--sans)', fontSize: '13px', color: '#888780',
                            cursor: 'pointer',
                          }}
                        >
                          + Log a match result
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Matches Tab ── */}
              {activeTab === 'matches' && (
                <div style={{ ...card, padding: '20px 24px' }}>
                  <p style={{ ...eyebrow, marginBottom: '16px' }}>All matches</p>
                  {allMatches.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', color: '#B4B2A9', marginBottom: '16px' }}>
                        No matches logged. Someone has to go first.
                      </p>
                      <button onClick={() => setLogMatchOpen(true)} style={btnDark}>Log first match</button>
                    </div>
                  ) : (
                    allMatches.map((m) => (
                      <MatchRow
                        key={m.id} match={m}
                        currentUserId={currentUserId || ''}
                        groupId={selectedGroupId!}
                        reactions={reactions[m.id] || []}
                        onReactionToggle={handleReactionToggle}
                      />
                    ))
                  )}
                </div>
              )}

              {/* ── Members Tab ── */}
              {activeTab === 'members' && (
                <div style={{ ...card, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <p style={eyebrow}>Roster</p>
                  </div>

                  {selectedGroup.group_members?.length === 0 ? (
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', color: '#B4B2A9', textAlign: 'center', padding: '24px 0' }}>
                      No members yet. Invite your crew.
                    </p>
                  ) : (
                    <div>
                      {/* Table header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '8px', padding: '0 0 8px', borderBottom: '0.5px solid #EAE6E1', marginBottom: '4px' }}>
                        <span style={{ ...eyebrow }}>Member</span>
                        <span style={{ ...eyebrow, textAlign: 'center' }}>HCP</span>
                        <span style={{ ...eyebrow, textAlign: 'right' }}>Team</span>
                      </div>
                      {selectedGroup.group_members.map((gm, i) => {
                        const profile = gm.profiles
                        const name = memberName(profile)
                        const isOwn = gm.user_id === currentUserId
                        // Find which team this member is on
                        let teamTag: string | null = null
                        if (activeComp) {
                          for (const t of activeComp.competition_teams) {
                            if (t.team_members?.some((tm) => tm.user_id === gm.user_id)) {
                              teamTag = t.name
                              break
                            }
                          }
                        }
                        const COLORS = ['#70798C', '#3B6D11', '#5A7A6B', '#8B7355', '#7C6B8E']
                        return (
                          <div key={gm.user_id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '8px', padding: '12px 0', borderBottom: '0.5px solid #EAE6E1', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 600, color: '#fff' }}>
                                  {name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', margin: 0, fontWeight: isOwn ? 600 : 400 }}>
                                  {name}{isOwn && ' (you)'}
                                </p>
                                {selectedGroup.created_by === gm.user_id && (
                                  <span style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: '#888780' }}>Organizer</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <HandicapCell
                                groupId={selectedGroupId!}
                                userId={gm.user_id}
                                initial={profile?.handicap ?? null}
                                isOwn={isOwn}
                                isOrganizer={isOrganizer}
                              />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              {teamTag && (
                                <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#888780', background: '#EAE6E1', padding: '2px 8px', borderRadius: '10px' }}>
                                  {teamTag}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Season at a glance */}
              {activeComp && (() => {
                const standings = computeStandings(activeComp)
                const totalMatches = allMatches.length
                const ptGap = standings ? Math.abs((standings[0]?.points || 0) - (standings[1]?.points || 0)) : 0
                const leading = standings?.sort((a, b) => b.points - a.points)[0]
                return (
                  <div style={{ ...card, padding: '20px' }}>
                    <p style={{ ...eyebrow, marginBottom: '12px' }}>Season at a glance</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { label: 'Matches', value: String(totalMatches) },
                        { label: 'Pt. gap', value: String(ptGap) },
                        { label: 'Season', value: String(activeComp.season_year) },
                        { label: 'Leading', value: leading?.team.name.split(' ')[1] || '—' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: '#F5F1ED', borderRadius: '8px', padding: '10px 12px' }}>
                          <p style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: '#888780', margin: '0 0 2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
                          <p style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: '#2C2A26', margin: 0 }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Roster card */}
              <div style={{ ...card, padding: '20px' }}>
                <p style={{ ...eyebrow, marginBottom: '12px' }}>Roster</p>
                {selectedGroup.group_members?.map((gm, i) => {
                  const name = memberName(gm.profiles)
                  const hcp = gm.profiles?.handicap
                  const COLORS = ['#70798C', '#3B6D11', '#5A7A6B', '#8B7355', '#7C6B8E']
                  return (
                    <div key={gm.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < (selectedGroup.group_members?.length || 0) - 1 ? '0.5px solid #EAE6E1' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--sans)', fontSize: '9px', fontWeight: 600, color: '#fff' }}>{name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#2C2A26' }}>{name}</span>
                      </div>
                      {hcp !== null && hcp !== undefined ? (
                        <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#888780' }}>+{hcp}</span>
                      ) : (
                        <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#854F0B', background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: '4px', padding: '1px 6px' }}>HCP —</span>
                      )}
                    </div>
                  )
                })}
                <button
                  onClick={() => toast.info('Share your club invite link to add members')}
                  style={{ display: 'flex', width: '100%', justifyContent: 'center', padding: '10px', marginTop: '12px', border: '1px dashed #D6CFC8', borderRadius: '8px', background: 'transparent', fontFamily: 'var(--sans)', fontSize: '12px', color: '#888780', cursor: 'pointer' }}
                >
                  + Invite member
                </button>
              </div>

              {/* Multiple groups switcher */}
              {groups.length > 1 && (
                <div style={{ ...card, padding: '20px' }}>
                  <p style={{ ...eyebrow, marginBottom: '10px' }}>Your clubs</p>
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroupId(g.id)}
                      style={{
                        display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px', borderRadius: '6px', background: g.id === selectedGroupId ? '#EAE6E1' : 'transparent',
                        border: 'none', cursor: 'pointer', marginBottom: '2px',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26' }}>{g.name}</span>
                      {g.id === selectedGroupId && <span style={{ fontSize: '10px', color: '#70798C' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {logMatchOpen && selectedGroup && (
        <LogMatchDialog
          groupId={selectedGroupId!}
          competition={activeComp}
          onClose={() => setLogMatchOpen(false)}
          onSaved={() => loadGroupData(selectedGroupId!)}
        />
      )}
      {createGroupOpen && (
        <CreateGroupDialog
          onClose={() => setCreateGroupOpen(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  )
}
