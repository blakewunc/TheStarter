'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'

interface Member {
  id: string
  role: string
  rsvp_status: string
  profiles: {
    id: string
    email: string
    display_name: string | null
  }
}

interface PeopleBarProps {
  tripId: string
  members: Member[]
  currentUserId: string | null
  inviteCode: string
}

export function PeopleBar({ tripId, members, currentUserId, inviteCode }: PeopleBarProps) {
  const [updating, setUpdating] = useState(false)

  const currentMember = members.find((m) => m.profiles.id === currentUserId)
  const currentStatus = currentMember?.rsvp_status || 'pending'

  const goingCount = members.filter((m) => m.rsvp_status === 'accepted').length
  const maybeCount = members.filter((m) => m.rsvp_status === 'maybe').length
  const pendingCount = members.filter((m) => m.rsvp_status === 'pending').length
  const declinedCount = members.filter((m) => m.rsvp_status === 'declined').length

  const updateRsvp = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp_status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update RSVP')
      toast.success(`RSVP updated to ${newStatus === 'accepted' ? 'Going' : newStatus === 'declined' ? "Can't Go" : 'Maybe'}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update RSVP')
    } finally {
      setUpdating(false)
    }
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(link)
    toast.success('Invite link copied!')
  }

  const getInitialBg = (index: number) => {
    const colors = ['bg-[#70798C]', 'bg-[#A99985]', 'bg-[#8B7355]', 'bg-[#6B8E7B]', 'bg-[#7C6B8E]']
    return colors[index % colors.length]
  }

  const maxAvatars = 6
  const displayMembers = members.slice(0, maxAvatars)
  const extraCount = members.length - maxAvatars

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Avatar stack + counts */}
        <div className="flex items-center gap-4">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {displayMembers.map((member, i) => {
              const name = member.profiles.display_name || member.profiles.email.split('@')[0]
              return (
                <div
                  key={member.id}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white ${getInitialBg(i)}`}
                  title={name}
                >
                  <span className="text-[10px] font-semibold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            })}
            {extraCount > 0 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#F5F1ED]">
                <span className="text-[10px] font-semibold text-[#A99985]">+{extraCount}</span>
              </div>
            )}
          </div>

          {/* RSVP counts */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#A99985]">
            {goingCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4A7C59]" />
                {goingCount} going
              </span>
            )}
            {maybeCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B8956A]" />
                {maybeCount} maybe
              </span>
            )}
            {pendingCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#DAD2BC]" />
                {pendingCount} pending
              </span>
            )}
            {declinedCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B4444]" />
                {declinedCount} declined
              </span>
            )}
          </div>
        </div>

        {/* Right: RSVP buttons + Invite */}
        <div className="flex items-center gap-2">
          {currentMember && (
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-xs text-[#A99985]">RSVP:</span>
              <button
                onClick={() => updateRsvp('accepted')}
                disabled={updating}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  currentStatus === 'accepted'
                    ? 'bg-[#4A7C59] text-white'
                    : 'border border-[#DAD2BC] text-[#A99985] hover:border-[#4A7C59] hover:text-[#4A7C59]'
                }`}
              >
                Going
              </button>
              <button
                onClick={() => updateRsvp('maybe')}
                disabled={updating}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  currentStatus === 'maybe'
                    ? 'bg-[#B8956A] text-white'
                    : 'border border-[#DAD2BC] text-[#A99985] hover:border-[#B8956A] hover:text-[#B8956A]'
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => updateRsvp('declined')}
                disabled={updating}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  currentStatus === 'declined'
                    ? 'bg-[#8B4444] text-white'
                    : 'border border-[#DAD2BC] text-[#A99985] hover:border-[#8B4444] hover:text-[#8B4444]'
                }`}
              >
                Can't Go
              </button>
            </div>
          )}

          <button
            onClick={copyInviteLink}
            className="ml-1 inline-flex items-center gap-1 rounded-[5px] border border-dashed border-[#DAD2BC] px-2.5 py-1 text-xs font-medium text-[#A99985] transition-colors hover:border-[#70798C] hover:text-[#252323]"
          >
            <UserPlus className="h-3 w-3" />
            Invite
          </button>
        </div>
      </div>

      {/* Progress nudge */}
      {members.length > 0 && (
        <div className="mt-3 border-t border-[#F5F1ED] pt-3">
          {pendingCount === 0 ? (
            <p className="text-xs text-[#4A7C59]">
              ✓ Everyone has responded
            </p>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F5F1ED]">
                <div
                  className="h-full rounded-full bg-[#4A7C59] transition-all"
                  style={{ width: `${Math.round(((members.length - pendingCount) / members.length) * 100)}%` }}
                />
              </div>
              <span className="shrink-0 text-xs text-[#A99985]">
                {members.length - pendingCount} of {members.length} responded
                {pendingCount > 0 && (
                  <button onClick={copyInviteLink} className="ml-1.5 text-[#70798C] underline-offset-2 hover:underline">
                    nudge them
                  </button>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
