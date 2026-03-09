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
}

interface Member {
  user_id: string
  display_name: string
}

export function TeeTimeList({ tripId }: TeeTimeListProps) {
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
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#252323]">Tee Times</h3>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          Schedule Round
        </Button>
      </div>

      {teeTimes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[5px] border border-dashed border-[#DAD2BC] bg-white py-12 text-center">
          <svg className="mb-3 h-10 w-10 text-[#DAD2BC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2v14M12 16c0 0-4 1.5-4 4h8c0-2.5-4-4-4-4z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2l6 4-6 4V2z" fill="currentColor" stroke="none" />
          </svg>
          <p className="text-sm font-medium text-[#252323]">No rounds scheduled yet</p>
          <p className="mt-1 text-xs text-[#A99985]">Add your first tee time to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teeTimes.map((teeTime: any) => (
            <div
              key={teeTime.id}
              className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[#252323]">{teeTime.course_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {teeTime.course_location && (
                      <p className="text-sm text-[#A99985]">{teeTime.course_location}</p>
                    )}
                    <span className="rounded-full bg-[#4A7C59]/10 px-2 py-0.5 text-xs font-medium text-[#4A7C59]">
                      Par {teeTime.par || 72}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#252323]">
                    {format(new Date(teeTime.tee_time), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-[#A99985]">
                    {format(new Date(teeTime.tee_time), 'h:mm a')}
                  </p>
                </div>
              </div>

              {teeTime.notes && (
                <p className="text-sm text-[#A99985]">{teeTime.notes}</p>
              )}

              <div className="flex items-center justify-between border-t border-[#DAD2BC] pt-2">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: teeTime.num_players || 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i < (teeTime.players?.length || 0) ? 'bg-[#4A7C59]' : 'bg-[#DAD2BC]'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-[#A99985]">
                    {teeTime.players?.length || 0}/{teeTime.num_players} players
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setScoreTeeTime({
                      id: teeTime.id,
                      course_name: teeTime.course_name,
                      par: teeTime.par || 72,
                    })
                  }
                  className="border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59]/5"
                >
                  Enter Scores
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTeeTimeDialog
        tripId={tripId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <EnterScoresDialog
        tripId={tripId}
        teeTime={scoreTeeTime}
        members={members}
        open={!!scoreTeeTime}
        onOpenChange={(open) => { if (!open) setScoreTeeTime(null) }}
      />
    </div>
  )
}
