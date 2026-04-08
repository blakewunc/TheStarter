'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SkeletonList } from '@/components/ui/skeleton'
import { AddTeeTimeDialog } from './AddTeeTimeDialog'
import { EnterScoresDialog } from './EnterScoresDialog'
import { useGolfTeeTimes } from '@/lib/hooks/useGolfTeeTimes'
import { format } from 'date-fns'

interface TeeTimeListProps {
  tripId: string
  /** Show only Enter Scores buttons — no schedule management */
  scoreOnly?: boolean
  onScoresSaved?: (courseName: string) => void
}

interface Member {
  user_id: string
  display_name: string
}

export function TeeTimeList({ tripId, scoreOnly = false, onScoresSaved }: TeeTimeListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [scoreTeeTime, setScoreTeeTime] = useState<{ id: string; course_name: string; par: number } | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const { teeTimes, loading, error } = useGolfTeeTimes(tripId)

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch(`/api/trips/${tripId}/members`)
        if (response.ok) {
          const data = await response.json()
          const memberList: Member[] = (data.members || []).map((m: any) => ({
            user_id: m.profiles?.id || m.user_id,
            display_name: m.profiles?.display_name || m.profiles?.email || 'Unknown',
          }))
          setMembers(memberList)
        }
      } catch {
        // Silently fail
      }
    }
    fetchMembers()
  }, [tripId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#252323]">Tee Times</h3>
        </div>
        <SkeletonList count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#252323]">Tee Times</h3>
        <div className="rounded-[5px] bg-red-50 p-3 text-sm text-[#8B4444]">
          Unable to load tee times. Please refresh the page.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section header — hidden in scoreOnly mode */}
      {!scoreOnly && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1C1A17]">Tee Times</h3>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            Schedule Round
          </Button>
        </div>
      )}

      {teeTimes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[5px] border border-dashed border-[#DAD2BC] bg-white/10 py-8 text-center">
          <p className="text-sm font-medium" style={{ color: scoreOnly ? 'rgba(245,241,237,0.60)' : '#1C1A17' }}>
            No rounds scheduled yet
          </p>
          {!scoreOnly && (
            <p className="mt-1 text-xs text-[#A09890]">Add your first tee time to get started</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {teeTimes.map((teeTime: any) => (
            <div
              key={teeTime.id}
              style={scoreOnly
                ? { borderRadius: '5px', border: '0.5px solid rgba(245,241,237,0.15)', background: 'rgba(245,241,237,0.08)', padding: '12px 14px' }
                : { borderRadius: '5px', border: '0.5px solid rgba(28,26,23,0.12)', background: '#fff', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
              }
            >
              {/* Course name + date — always shown */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: scoreOnly ? '#F5F1ED' : '#1C1A17' }}>
                    {teeTime.course_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: scoreOnly ? 'rgba(245,241,237,0.50)' : '#A09890' }}>
                    {format(new Date(teeTime.tee_time), 'MMM d · h:mm a')} · Par {teeTime.par || 72}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setScoreTeeTime({
                      id: teeTime.id,
                      course_name: teeTime.course_name,
                      par: teeTime.par || 72,
                    })
                  }
                  style={{
                    background: scoreOnly ? 'rgba(245,241,237,0.15)' : 'transparent',
                    border: scoreOnly ? 'none' : '0.5px solid #3B6D11',
                    color: scoreOnly ? '#F5F1ED' : '#3B6D11',
                    borderRadius: '5px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Enter Scores
                </button>
              </div>

              {/* Player dots + meta — only in full mode */}
              {!scoreOnly && (
                <>
                  {teeTime.notes && (
                    <p className="text-xs text-[#A09890] mt-1">{teeTime.notes}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[rgba(28,26,23,0.07)]">
                    {Array.from({ length: teeTime.num_players || 4 }).map((_: unknown, i: number) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < (teeTime.players?.length || 0) ? 'bg-[#3B6D11]' : 'bg-[#DAD2BC]'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-[#A09890]">
                      {teeTime.players?.length || 0}/{teeTime.num_players} players
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!scoreOnly && (
        <AddTeeTimeDialog
          tripId={tripId}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      )}

      <EnterScoresDialog
        tripId={tripId}
        teeTime={scoreTeeTime}
        members={members}
        open={!!scoreTeeTime}
        onOpenChange={(open) => { if (!open) setScoreTeeTime(null) }}
        onScoresSaved={onScoresSaved}
      />
    </div>
  )
}
