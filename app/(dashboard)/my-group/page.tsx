'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile { display_name: string | null; email: string | null }
interface GroupMember { user_id: string; profiles: Profile | null }
interface MatchSide { side: 'a' | 'b'; user_id: string | null; team_id: string | null }
interface Team { id: string; name: string; color: string; team_members: { user_id: string; profiles: Profile | null }[] }
interface MatchResult { winner: 'a' | 'b' | 'tie'; points_a: number; points_b: number }
interface Match {
  id: string
  competition_id: string
  played_on: string
  course: string | null
  format: string
  status: string
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

// ─── Player stat types ────────────────────────────────────────────────────────

interface PlayerStat {
  user_id: string
  name: string
  wins: number
  losses: number
  ties: number
  totalMatches: number
  winPct: number
  hotStreak: number // consecutive wins (most recent first)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function memberName(p: Profile | null) {
  return p?.display_name || p?.email?.split('@')[0] || 'Unknown'
}

function computeStandings(competition: Competition) {
  const teams = competition.competition_teams
  if (!teams || teams.length < 2) return null

  const pts: Record<string, number> = {}
  for (const t of teams) pts[t.id] = 0

  for (const m of competition.matches || []) {
    const result = m.match_results?.[0]
    if (!result) continue
    if (teams[0]) pts[teams[0].id] = (pts[teams[0].id] || 0) + (result.points_a || 0)
    if (teams[1]) pts[teams[1].id] = (pts[teams[1].id] || 0) + (result.points_b || 0)
  }

  return teams.map((t) => ({ team: t, points: pts[t.id] || 0 }))
}

function computePlayerStats(competition: Competition, members: GroupMember[]): PlayerStat[] {
  const matches = [...(competition.matches || [])].sort(
    (a, b) => a.played_on.localeCompare(b.played_on)
  )

  const stats: Record<string, { wins: number; losses: number; ties: number; dates: string[] }> = {}

  for (const m of members) {
    stats[m.user_id] = { wins: 0, losses: 0, ties: 0, dates: [] }
  }

  for (const match of matches) {
    const result = match.match_results?.[0]
    if (!result) continue
    const sides = match.match_sides || []

    for (const side of sides) {
      if (!side.user_id || !stats[side.user_id]) continue
      const playerSide = side.side
      const winner = result.winner
      if (winner === 'tie') {
        stats[side.user_id].ties++
        stats[side.user_id].dates.push('tie')
      } else if (winner === playerSide) {
        stats[side.user_id].wins++
        stats[side.user_id].dates.push('win')
      } else {
        stats[side.user_id].losses++
        stats[side.user_id].dates.push('loss')
      }
    }
  }

  return members.map((m) => {
    const s = stats[m.user_id] || { wins: 0, losses: 0, ties: 0, dates: [] }
    const total = s.wins + s.losses + s.ties
    const winPct = total > 0 ? (s.wins + s.ties * 0.5) / total : 0

    // Hot streak: count consecutive wins from most recent
    let streak = 0
    for (let i = s.dates.length - 1; i >= 0; i--) {
      if (s.dates[i] === 'win') streak++
      else break
    }

    return {
      user_id: m.user_id,
      name: memberName(m.profiles),
      wins: s.wins,
      losses: s.losses,
      ties: s.ties,
      totalMatches: total,
      winPct,
      hotStreak: streak,
    }
  }).filter((p) => p.totalMatches > 0).sort((a, b) => b.winPct - a.winPct)
}

function formatWinner(result: MatchResult, teams: Team[]) {
  if (result.winner === 'tie') return 'Tied'
  if (result.winner === 'a' && teams[0]) return `${teams[0].name} won`
  if (result.winner === 'b' && teams[1]) return `${teams[1].name} won`
  return 'Complete'
}

// ─── Log Match Modal ──────────────────────────────────────────────────────────

function LogMatchModal({
  group,
  competition,
  onClose,
  onLogged,
}: {
  group: Group
  competition: Competition
  onClose: () => void
  onLogged: () => void
}) {
  const [fmt, setFmt] = useState('1v1')
  const [playedOn, setPlayedOn] = useState(new Date().toISOString().split('T')[0])
  const [course, setCourse] = useState('')
  const [winner, setWinner] = useState<'a' | 'b' | 'tie' | ''>('')
  const [sideAUser, setSideAUser] = useState('')
  const [sideBUser, setSideBUser] = useState('')
  const [loading, setLoading] = useState(false)

  const members = group.group_members
  const teams = competition.competition_teams
  const isRyderCup = competition.format === 'ryder_cup' && teams.length === 2

  const handleSubmit = async () => {
    if (!winner) { toast.error('Select a winner'); return }
    setLoading(true)
    try {
      const body: any = {
        competition_id: competition.id,
        played_on: playedOn,
        course: course || null,
        format: fmt,
        winner,
        points_a: winner === 'a' ? 1 : winner === 'tie' ? 0.5 : 0,
        points_b: winner === 'b' ? 1 : winner === 'tie' ? 0.5 : 0,
      }

      if (isRyderCup) {
        body.side_a = { team_id: teams[0].id }
        body.side_b = { team_id: teams[1].id }
      } else {
        body.side_a = { user_ids: sideAUser ? [sideAUser] : [] }
        body.side_b = { user_ids: sideBUser ? [sideBUser] : [] }
      }

      const res = await fetch(`/api/groups/${group.id}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Match logged')
      onLogged()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: '#A09890', display: 'block', marginBottom: '6px',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', height: '44px', border: '0.5px solid rgba(28,26,23,0.20)',
    borderRadius: '5px', padding: '0 12px', fontSize: '14px', color: '#1C1A17',
    background: '#fff', boxSizing: 'border-box',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,23,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: '12px 12px 0 0', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A09890', marginBottom: '2px' }}>Log a Match</p>
            <h2 style={{ fontSize: '18px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {competition.name}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A09890', fontSize: '20px' }}>×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Date Played</label>
              <input type="date" value={playedOn} onChange={(e) => setPlayedOn(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Course (optional)</label>
              <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Pinehurst No. 2" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Match Format</label>
            <div style={{ display: 'flex', border: '0.5px solid rgba(28,26,23,0.15)', borderRadius: '5px', overflow: 'hidden' }}>
              {(['1v1', '2v2', 'scramble', 'stroke_play'] as const).map((f) => (
                <button key={f} onClick={() => setFmt(f)} style={{ flex: 1, height: '40px', border: 'none', background: fmt === f ? '#1C1A17' : '#fff', color: fmt === f ? '#F5F1ED' : '#6B6460', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {!isRyderCup && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Side A</label>
                <select value={sideAUser} onChange={(e) => setSideAUser(e.target.value)} style={{ ...inputStyle, appearance: 'none' as any }}>
                  <option value="">Select player</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{memberName(m.profiles)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Side B</label>
                <select value={sideBUser} onChange={(e) => setSideBUser(e.target.value)} style={{ ...inputStyle, appearance: 'none' as any }}>
                  <option value="">Select player</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{memberName(m.profiles)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Result</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { key: 'a', label: isRyderCup && teams[0] ? `${teams[0].name} wins` : 'Side A wins' },
                { key: 'tie', label: 'Tied' },
                { key: 'b', label: isRyderCup && teams[1] ? `${teams[1].name} wins` : 'Side B wins' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setWinner(key as 'a' | 'b' | 'tie')}
                  style={{ height: '52px', border: `0.5px solid ${winner === key ? '#1C1A17' : 'rgba(28,26,23,0.15)'}`, borderRadius: '5px', background: winner === key ? '#1C1A17' : '#fff', color: winner === key ? '#F5F1ED' : '#6B6460', fontSize: '12px', fontWeight: 500, cursor: 'pointer', padding: '4px 8px', lineHeight: 1.3 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !winner}
            style={{ width: '100%', height: '48px', background: loading || !winner ? '#A09890' : '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 500, cursor: loading || !winner ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', marginTop: '4px' }}
          >
            {loading ? 'Logging...' : 'Log Match →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Group Modal ───────────────────────────────────────────────────────

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (g: Group) => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Enter a group name'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const { group } = await res.json()
      onCreated(group)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,23,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '20px' }}>Create a Group</h2>
        <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A09890', display: 'block', marginBottom: '6px' }}>Group Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} placeholder="e.g. The Saturday Boys" autoFocus style={{ width: '100%', height: '44px', border: '0.5px solid rgba(28,26,23,0.20)', borderRadius: '5px', padding: '0 12px', fontSize: '14px', color: '#1C1A17', background: '#fff', boxSizing: 'border-box', marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleCreate} disabled={loading} style={{ flex: 1, height: '44px', background: '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
          <button onClick={onClose} style={{ height: '44px', padding: '0 20px', background: 'transparent', color: '#6B6460', border: '0.5px solid rgba(28,26,23,0.20)', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Start Competition Modal ───────────────────────────────────────────────────

function StartCompetitionModal({ groupId, onClose, onCreated }: { groupId: string; onClose: () => void; onCreated: () => void }) {
  const [teamAName, setTeamAName] = useState('')
  const [teamBName, setTeamBName] = useState('')
  const [loading, setLoading] = useState(false)

  const COLORS = ['#70798C', '#B5A98A', '#4A7C59', '#8B4444', '#5A6270', '#A09890']
  const [teamAColor, setTeamAColor] = useState(COLORS[0])
  const [teamBColor, setTeamBColor] = useState(COLORS[1])

  const handleCreate = async () => {
    const nameA = teamAName.trim() || 'Team A'
    const nameB = teamBName.trim() || 'Team B'
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/competitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${new Date().getFullYear()} Ryder Cup`,
          format: 'ryder_cup',
          teams: [
            { name: nameA, color: teamAColor },
            { name: nameB, color: teamBColor },
          ],
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Competition started!')
      onCreated()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', height: '44px', border: '0.5px solid rgba(28,26,23,0.20)', borderRadius: '5px', padding: '0 12px', fontSize: '14px', color: '#1C1A17', background: '#fff', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#A09890', display: 'block', marginBottom: '6px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,23,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', width: '100%', maxWidth: '440px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '6px' }}>Start a Ryder Cup Season</h2>
        <p style={{ fontSize: '12px', color: '#A09890', marginBottom: '24px' }}>Name your teams — leave blank to use Team A / Team B</p>

        <div className="space-y-4">
          {/* Team A */}
          <div>
            <label style={labelStyle}>Team A Name</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="text" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} placeholder="Team A" style={{ ...inputStyle, flex: 1 }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                {COLORS.slice(0, 3).map((c) => (
                  <button key={c} onClick={() => setTeamAColor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: teamAColor === c ? '2px solid #1C1A17' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Team B */}
          <div>
            <label style={labelStyle}>Team B Name</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="text" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} placeholder="Team B" style={{ ...inputStyle, flex: 1 }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                {COLORS.slice(3).map((c) => (
                  <button key={c} onClick={() => setTeamBColor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: teamBColor === c ? '2px solid #1C1A17' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button onClick={handleCreate} disabled={loading} style={{ flex: 1, height: '44px', background: '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Starting...' : 'Start Season →'}
          </button>
          <button onClick={onClose} style={{ height: '44px', padding: '0 20px', background: 'transparent', color: '#6B6460', border: '0.5px solid rgba(28,26,23,0.20)', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Player Stats Table ───────────────────────────────────────────────────────

function PlayerStatsTable({ stats, teams }: { stats: PlayerStat[]; teams: Team[] }) {
  if (stats.length === 0) return null

  return (
    <div>
      <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A09890', marginBottom: '12px', fontWeight: 600 }}>
        Player Stats
      </p>
      <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 48px 48px 72px', gap: '0', padding: '10px 16px', borderBottom: '0.5px solid rgba(28,26,23,0.08)', background: 'rgba(28,26,23,0.02)' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A09890' }}>Player</span>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A09890', textAlign: 'center' }}>W</span>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A09890', textAlign: 'center' }}>L</span>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A09890', textAlign: 'center' }}>T</span>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A09890', textAlign: 'right' }}>Win %</span>
        </div>

        {stats.map((p, i) => {
          // Find team color for this player
          const teamColor = teams.find((t) =>
            t.team_members?.some((tm) => tm.user_id === p.user_id)
          )?.color

          return (
            <div
              key={p.user_id}
              style={{ display: 'grid', gridTemplateColumns: '1fr 48px 48px 48px 72px', gap: '0', padding: '12px 16px', borderBottom: i < stats.length - 1 ? '0.5px solid rgba(28,26,23,0.05)' : 'none', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                {teamColor && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: teamColor, flexShrink: 0 }} />
                )}
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#1C1A17', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                {p.hotStreak >= 3 && (
                  <span title={`${p.hotStreak} win streak`} style={{ fontSize: '14px', flexShrink: 0 }}>🔥</span>
                )}
              </div>
              <span style={{ fontSize: '13px', color: '#3B6D11', textAlign: 'center', fontWeight: 600 }}>{p.wins}</span>
              <span style={{ fontSize: '13px', color: '#8B4444', textAlign: 'center', fontWeight: 600 }}>{p.losses}</span>
              <span style={{ fontSize: '13px', color: '#6B6460', textAlign: 'center' }}>{p.ties}</span>
              <span style={{ fontSize: '12px', color: '#1C1A17', textAlign: 'right', fontWeight: 500 }}>
                {p.totalMatches > 0 ? `${Math.round(p.winPct * 100)}%` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyGroupPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showStartCompetition, setShowStartCompetition] = useState(false)
  const [logMatchCompetition, setLogMatchCompetition] = useState<{ group: Group; competition: Competition } | null>(null)
  const [competitionsData, setCompetitionsData] = useState<Record<string, Competition[]>>({})

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
        if (data.groups?.length > 0 && !activeGroupId) {
          setActiveGroupId(data.groups[0].id)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [activeGroupId])

  useEffect(() => { fetchGroups() }, [])

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null

  useEffect(() => {
    if (!activeGroupId || competitionsData[activeGroupId]) return
    fetch(`/api/groups/${activeGroupId}/competitions`)
      .then((r) => r.json())
      .then((data) => {
        setCompetitionsData((prev) => ({ ...prev, [activeGroupId]: data.competitions || [] }))
      })
      .catch(() => {})
  }, [activeGroupId, competitionsData])

  const activeCompetitions = activeGroupId ? (competitionsData[activeGroupId] ?? []) : []
  const activeComp = activeCompetitions[0] ?? null

  const refreshCompetitions = () => {
    if (activeGroupId) {
      setCompetitionsData((prev) => { const copy = { ...prev }; delete copy[activeGroupId]; return copy })
    }
  }

  const handleGroupCreated = (group: Group) => {
    setGroups((prev) => [group, ...prev])
    setActiveGroupId(group.id)
    setShowCreateGroup(false)
  }

  const handleMatchLogged = () => {
    setLogMatchCompetition(null)
    refreshCompetitions()
  }

  // Compute player stats for the active competition
  const playerStats = activeGroup && activeComp
    ? computePlayerStats(activeComp, activeGroup.group_members)
    : []

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div style={{ height: '24px', width: '200px', background: 'rgba(28,26,23,0.08)', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ height: '16px', width: '120px', background: 'rgba(28,26,23,0.05)', borderRadius: '4px' }} />
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: '8px' }}>My Group</p>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '40px' }}>
            Track your season competition
          </h1>
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '48px', textAlign: 'center', maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏆</div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#1C1A17', marginBottom: '8px' }}>Start a group</h2>
            <p style={{ fontSize: '13px', color: '#6B6460', marginBottom: '24px', lineHeight: 1.6 }}>
              Create a group with your regular crew. Log matches, track Ryder Cup standings, and see who's buying drinks.
            </p>
            <button onClick={() => setShowCreateGroup(true)} style={{ background: '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: '5px', padding: '12px 28px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em' }}>
              Create a Group
            </button>
          </div>
        </div>
        {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} onCreated={handleGroupCreated} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: '6px' }}>My Group</p>
            <h1 style={{ fontSize: '26px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {activeGroup?.name ?? 'My Group'}
            </h1>
          </div>
          <button onClick={() => setShowCreateGroup(true)} style={{ background: 'transparent', border: '0.5px solid rgba(28,26,23,0.20)', borderRadius: '5px', padding: '8px 16px', fontSize: '12px', color: '#6B6460', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + New Group
          </button>
        </div>

        {/* Group tabs */}
        {groups.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
            {groups.map((g) => (
              <button key={g.id} onClick={() => setActiveGroupId(g.id)} style={{ padding: '6px 16px', borderRadius: '20px', border: '0.5px solid rgba(28,26,23,0.15)', background: g.id === activeGroupId ? '#1C1A17' : '#fff', color: g.id === activeGroupId ? '#F5F1ED' : '#6B6460', fontSize: '12px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {g.name}
              </button>
            ))}
          </div>
        )}

        {activeGroup && (
          <div className="space-y-6">
            {/* Standings card */}
            {activeComp ? (
              <div style={{ background: '#1C1A17', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '0.5px solid rgba(245,241,237,0.08)' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.40)', marginBottom: '4px' }}>
                    {activeComp.season_year} · {activeComp.format.replace('_', ' ')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                      {activeComp.name}
                    </h2>
                    <button
                      onClick={() => setLogMatchCompetition({ group: activeGroup, competition: activeComp })}
                      style={{ background: 'rgba(245,241,237,0.12)', border: 'none', borderRadius: '5px', padding: '8px 16px', fontSize: '12px', color: '#F5F1ED', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em' }}
                    >
                      + Log Match
                    </button>
                  </div>
                </div>

                {activeComp.format === 'ryder_cup' && (() => {
                  const standings = computeStandings(activeComp)
                  if (!standings) return null
                  const total = standings[0].points + standings[1].points
                  const pctA = total > 0 ? (standings[0].points / total) * 100 : 50

                  return (
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: standings[0].team.color, marginBottom: '6px' }} />
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#F5F1ED', marginBottom: '2px' }}>{standings[0].team.name}</p>
                          <p style={{ fontSize: '32px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1 }}>
                            {standings[0].points % 1 === 0 ? standings[0].points : standings[0].points.toFixed(1)}
                          </p>
                        </div>
                        <p style={{ fontSize: '16px', color: 'rgba(245,241,237,0.30)', fontWeight: 300 }}>vs</p>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: standings[1].team.color, marginBottom: '6px', marginLeft: 'auto' }} />
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#F5F1ED', marginBottom: '2px' }}>{standings[1].team.name}</p>
                          <p style={{ fontSize: '32px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1 }}>
                            {standings[1].points % 1 === 0 ? standings[1].points : standings[1].points.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(245,241,237,0.10)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pctA}%`, background: standings[0].team.color, transition: 'width 0.4s ease' }} />
                      </div>
                      <p style={{ fontSize: '11px', color: 'rgba(245,241,237,0.35)', marginTop: '8px' }}>
                        {(activeComp.matches || []).length} match{(activeComp.matches || []).length !== 1 ? 'es' : ''} played
                      </p>
                    </div>
                  )
                })()}

                {activeComp.format !== 'ryder_cup' && (
                  <div style={{ padding: '20px 24px' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(245,241,237,0.40)' }}>
                      {(activeComp.matches || []).length} match{(activeComp.matches || []).length !== 1 ? 'es' : ''} logged
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1A17', marginBottom: '6px' }}>No competition yet</p>
                <p style={{ fontSize: '12px', color: '#A09890', marginBottom: '20px' }}>
                  Start a Ryder Cup season or track individual matches
                </p>
                <button
                  onClick={() => setShowStartCompetition(true)}
                  style={{ background: '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: '5px', padding: '10px 24px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Start a Ryder Cup Season
                </button>
              </div>
            )}

            {/* Player stats table — only when there are stats to show */}
            {playerStats.length > 0 && (
              <PlayerStatsTable stats={playerStats} teams={activeComp?.competition_teams ?? []} />
            )}

            {/* Recent matches */}
            {activeComp && (activeComp.matches || []).length > 0 && (
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A09890', marginBottom: '12px', fontWeight: 600 }}>
                  Recent Matches
                </p>
                <div className="space-y-2">
                  {[...(activeComp.matches || [])]
                    .sort((a, b) => b.played_on.localeCompare(a.played_on))
                    .slice(0, 8)
                    .map((match) => {
                      const result = match.match_results?.[0]
                      return (
                        <div key={match.id} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.08)', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1A17' }}>{match.course || match.format}</p>
                            <p style={{ fontSize: '11px', color: '#A09890', marginTop: '1px' }}>
                              {format(parseISO(match.played_on), 'MMM d, yyyy')}
                              {match.course && match.format !== '1v1' && ` · ${match.format}`}
                            </p>
                          </div>
                          {result && (
                            <span style={{ fontSize: '11px', fontWeight: 500, color: result.winner === 'tie' ? '#6B6460' : '#3B6D11', background: result.winner === 'tie' ? 'rgba(28,26,23,0.06)' : 'rgba(59,109,17,0.08)', borderRadius: '4px', padding: '3px 8px' }}>
                              {formatWinner(result, activeComp.competition_teams)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A09890', marginBottom: '12px', fontWeight: 600 }}>
                Members · {activeGroup.group_members.length}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeGroup.group_members.map((m) => (
                  <div key={m.user_id} style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.08)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#1C1A17', fontWeight: 500 }}>
                    {memberName(m.profiles)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} onCreated={handleGroupCreated} />
      )}

      {showStartCompetition && activeGroup && (
        <StartCompetitionModal
          groupId={activeGroup.id}
          onClose={() => setShowStartCompetition(false)}
          onCreated={refreshCompetitions}
        />
      )}

      {logMatchCompetition && (
        <LogMatchModal
          group={logMatchCompetition.group}
          competition={logMatchCompetition.competition}
          onClose={() => setLogMatchCompetition(null)}
          onLogged={handleMatchLogged}
        />
      )}
    </div>
  )
}
