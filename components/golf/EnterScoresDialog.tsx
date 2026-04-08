'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface TeeTime {
  id: string
  course_name: string
  par: number
  tee_time?: string
}

interface Member {
  user_id: string
  display_name: string
  handicap?: number | null
}

interface EnterScoresDialogProps {
  tripId: string
  teeTime: TeeTime | null
  members: Member[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onScoresSaved?: (courseName: string) => void
}

type Mode = 'final' | 'hole-by-hole'

function relToPar(score: number, par: number) {
  const diff = score - par
  if (diff === 0) return { text: 'E', color: '#A09890' }
  if (diff > 0) return { text: `+${diff}`, color: '#8B4444' }
  return { text: `${diff}`, color: '#3B6D11' }
}

export function EnterScoresDialog({
  tripId,
  teeTime,
  members,
  open,
  onOpenChange,
  onScoresSaved,
}: EnterScoresDialogProps) {
  const [mode, setMode] = useState<Mode>('final')
  const [loading, setLoading] = useState(false)

  // Final score mode: { userId: grossScoreString }
  const [finalScores, setFinalScores] = useState<Record<string, string>>({})
  // Handicaps from equipment (fetched once)
  const [handicaps, setHandicaps] = useState<Record<string, number | null>>({})

  // Fetch existing scores + handicaps when dialog opens
  useEffect(() => {
    if (!open || !teeTime) return

    async function fetchData() {
      try {
        const [scoresRes, equipRes] = await Promise.all([
          fetch(`/api/trips/${tripId}/golf/scores`),
          fetch(`/api/trips/${tripId}/golf/equipment`),
        ])

        if (scoresRes.ok && teeTime) {
          const data = await scoresRes.json()
          const initial: Record<string, string> = {}
          for (const s of data.scores || []) {
            if (s.tee_time_id === teeTime.id) {
              initial[s.user_id] = String(s.score)
            }
          }
          setFinalScores(initial)
        }

        if (equipRes.ok) {
          const data = await equipRes.json()
          const hcpMap: Record<string, number | null> = {}
          for (const eq of data.equipment || []) {
            hcpMap[eq.user_id] = eq.handicap ?? null
          }
          setHandicaps(hcpMap)
        }
      } catch {
        // silently fail
      }
    }

    fetchData()
  }, [open, teeTime, tripId])

  if (!teeTime) return null
  const par = teeTime.par || 72

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const scoreEntries = Object.entries(finalScores)
        .filter(([, val]) => val && parseInt(val) > 0)
        .map(([userId, val]) => ({ user_id: userId, score: parseInt(val) }))

      if (scoreEntries.length === 0) {
        toast.error('Enter at least one score')
        setLoading(false)
        return
      }

      const res = await fetch(`/api/trips/${tripId}/golf/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tee_time_id: teeTime.id, scores: scoreEntries }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save scores')
      }

      toast.success('Scores saved')
      onOpenChange(false)
      onScoresSaved?.(teeTime.course_name)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const hasExistingScores = Object.keys(finalScores).some((k) => finalScores[k])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <div style={{ background: '#1C1A17', padding: '20px 24px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.45)', marginBottom: '4px' }}>
            Scorecard
          </p>
          <h2 style={{ fontSize: '20px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0 }}>
            {teeTime.course_name}
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(245,241,237,0.50)', marginTop: '4px' }}>
            Par {par}{teeTime.tee_time ? ` · ${format(new Date(teeTime.tee_time), 'MMM d, h:mm a')}` : ''}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ padding: '16px 24px 0', borderBottom: '0.5px solid rgba(28,26,23,0.08)' }}>
          <div style={{ display: 'flex', gap: '0', borderRadius: '5px', border: '0.5px solid rgba(28,26,23,0.15)', overflow: 'hidden', width: 'fit-content' }}>
            {(['final', 'hole-by-hole'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '6px 16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  background: mode === m ? '#1C1A17' : '#fff',
                  color: mode === m ? '#F5F1ED' : '#6B6460',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'final' ? 'Final Score' : 'Hole by Hole'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#A09890', marginTop: '8px', marginBottom: '12px' }}>
            {mode === 'final'
              ? 'Enter the total gross score for each player'
              : 'Coming soon — enter score per hole as you play'}
          </p>
        </div>

        {/* Scorecard rows */}
        {mode === 'final' ? (
          <div style={{ padding: '4px 0 0' }}>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 60px', gap: '0', padding: '8px 24px', borderBottom: '0.5px solid rgba(28,26,23,0.06)' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A09890' }}>Player</span>
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A09890', textAlign: 'center' }}>Gross</span>
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A09890', textAlign: 'center' }}>HCP</span>
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A09890', textAlign: 'center' }}>Net</span>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {members.map((member, idx) => {
                const gross = finalScores[member.user_id] ? parseInt(finalScores[member.user_id]) : NaN
                const hcp = handicaps[member.user_id] ?? member.handicap ?? null
                const net = !isNaN(gross) && hcp !== null ? gross - hcp : null
                const rel = !isNaN(gross) && gross > 0 ? relToPar(gross, par) : null

                return (
                  <div
                    key={member.user_id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 60px 60px',
                      gap: '0',
                      padding: '12px 24px',
                      alignItems: 'center',
                      background: idx % 2 === 0 ? '#fff' : '#FAFAF9',
                      borderBottom: '0.5px solid rgba(28,26,23,0.05)',
                    }}
                  >
                    {/* Player name */}
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1C1A17', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                      {member.display_name}
                    </span>

                    {/* Gross score input */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <input
                        type="number"
                        min="40"
                        max="200"
                        inputMode="numeric"
                        placeholder="--"
                        value={finalScores[member.user_id] || ''}
                        onChange={(e) =>
                          setFinalScores((prev) => ({ ...prev, [member.user_id]: e.target.value }))
                        }
                        disabled={loading}
                        style={{
                          width: '64px',
                          height: '44px',
                          textAlign: 'center',
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#1C1A17',
                          border: '0.5px solid rgba(28,26,23,0.20)',
                          borderRadius: '5px',
                          background: '#fff',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield',
                        }}
                      />
                      {rel && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: rel.color }}>
                          {rel.text}
                        </span>
                      )}
                    </div>

                    {/* Handicap */}
                    <span style={{ fontSize: '14px', color: '#6B6460', textAlign: 'center' }}>
                      {hcp !== null ? hcp : <span style={{ color: '#DAD2BC' }}>—</span>}
                    </span>

                    {/* Net score */}
                    <span style={{ fontSize: '14px', fontWeight: net !== null ? 600 : 400, color: net !== null ? '#1C1A17' : '#DAD2BC', textAlign: 'center' }}>
                      {net !== null ? net : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#A09890' }}>
              Hole-by-hole entry is coming soon. Use Final Score mode to record your round.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: '16px 24px', borderTop: '0.5px solid rgba(28,26,23,0.08)', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading || mode !== 'final'}
            style={{
              flex: 1,
              height: '44px',
              background: loading ? '#A09890' : '#1C1A17',
              color: '#F5F1ED',
              border: 'none',
              borderRadius: '5px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            {loading ? 'Saving...' : hasExistingScores ? 'Update Scores' : 'Save Scores'}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            style={{
              height: '44px',
              padding: '0 20px',
              background: 'transparent',
              color: '#6B6460',
              border: '0.5px solid rgba(28,26,23,0.20)',
              borderRadius: '5px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
