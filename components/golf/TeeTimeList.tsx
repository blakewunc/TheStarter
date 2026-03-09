'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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

  // Fetch trip members for score entry
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
    return <p className="text-sm text-[#A99985]">Loading tee times...</p>
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  return (
    <div className="space-y-4">
      {teeTimes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[#A99985] mb-4">No tee times scheduled yet</p>
          <Button onClick={() => setShowAddDialog(true)}>
            Add First Tee Time
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {teeTimes.map((teeTime: any) => (
              <div
                key={teeTime.id}
                className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-[#252323]">{teeTime.course_name}</h4>
                    <div className="flex items-center gap-2">
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

                <div className="flex items-center justify-between pt-2 border-t border-[#DAD2BC]">
                  <p className="text-xs text-[#A99985]">
                    {teeTime.players?.length || 0} / {teeTime.num_players} players
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setScoreTeeTime({
                        id: teeTime.id,
                        course_name: teeTime.course_name,
                        par: teeTime.par || 72,
                      })
                    }
                  >
                    Enter Scores
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => setShowAddDialog(true)} className="w-full">
            Add Tee Time
          </Button>
        </>
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
