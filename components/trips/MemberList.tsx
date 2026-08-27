'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Profile {
  id: string
  email: string
  display_name: string | null
}

interface TripMember {
  id: string
  role: string
  rsvp_status: string
  budget_cap: number | null
  created_at: string
  profiles: Profile
}

interface PendingInvite {
  id: string
  email: string
  name: string | null
  created_at: string
}

interface MemberListProps {
  members: TripMember[]
  inviteCode: string
  tripId: string
  isOrganizer: boolean
  currentUserId: string | null
  pendingInvites?: PendingInvite[]
  onRefresh?: () => void
}

export function MemberList({
  members,
  inviteCode,
  tripId,
  isOrganizer,
  currentUserId,
  pendingInvites = [],
  onRefresh,
}: MemberListProps) {
  const [addEmail, setAddEmail] = useState('')
  const [addName, setAddName] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(link)
    toast.success('Invite link copied to clipboard!')
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addEmail.trim()) return

    setAdding(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addEmail.trim().toLowerCase(),
          name: addName.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to add member')

      toast.success(data.member ? 'Member added to trip!' : 'Invite sent! They\'ll be added when they sign up.')
      setAddEmail('')
      setAddName('')
      setShowAddForm(false)
      onRefresh?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setAdding(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'organizer' | 'member') => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update role')

      toast.success(`Role updated to ${newRole}`)
      onRefresh?.()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`Remove ${name} from this trip?`)) return

    try {
      const response = await fetch(`/api/trips/${tripId}/members/${memberId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to remove member')

      toast.success('Member removed from trip')
      onRefresh?.()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members/${inviteId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to cancel invite')

      toast.success('Invite cancelled')
      onRefresh?.()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getRsvpBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700'
      case 'declined':
        return 'bg-red-50 text-red-700'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700'
      default:
        return 'bg-[#F5F1ED] text-[#6B6460]'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'organizer'
      ? 'bg-purple-50 text-purple-700'
      : 'bg-blue-50 text-blue-700'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1C1A17]">Trip Members</h3>
          <p className="text-sm text-[#6B6460]">
            {members.length} {members.length === 1 ? 'person' : 'people'} in this trip
            {pendingInvites.length > 0 && ` + ${pendingInvites.length} pending`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOrganizer && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-[5px] bg-[#3B6D11] px-4 py-2 text-sm font-medium text-white hover:bg-[#2F5A0E] transition-colors"
            >
              Add Member
            </button>
          )}
          <button
            onClick={copyInviteLink}
            className="rounded-[5px] border border-[#DAD2BC] bg-white px-4 py-2 text-sm font-medium text-[#1C1A17] hover:bg-[#F5F1ED] transition-colors"
          >
            Copy Invite Link
          </button>
        </div>
      </div>

      {/* Add Member Form */}
      {showAddForm && isOrganizer && (
        <form onSubmit={handleAddMember} className="rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED] p-4">
          <p className="mb-3 text-sm font-medium text-[#1C1A17]">Add member by email</p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              required
              className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
            />
            <input
              type="text"
              placeholder="Name (optional)"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={adding} size="sm">
                {adding ? 'Adding...' : 'Add'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#6B6460]">
            If they don&apos;t have an account yet, they&apos;ll be added automatically when they sign up.
          </p>
        </form>
      )}

      {/* Active Members */}
      <div className="space-y-2">
        {members.map((member) => {
          const isCurrentUser = member.profiles.id === currentUserId
          const displayName = member.profiles.display_name || member.profiles.email

          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-[5px] border border-[#DAD2BC] bg-white p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B6D11]">
                  <span className="text-sm font-semibold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[#1C1A17]">
                    {displayName}
                    {isCurrentUser && <span className="ml-1 text-xs text-[#6B6460]">(you)</span>}
                  </p>
                  {member.profiles.display_name && (
                    <p className="text-sm text-[#6B6460]">{member.profiles.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                    member.role
                  )}`}
                >
                  {member.role}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRsvpBadgeColor(
                    member.rsvp_status
                  )}`}
                >
                  {member.rsvp_status}
                </span>

                {/* Admin actions */}
                {isOrganizer && !isCurrentUser && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleRoleChange(member.id, member.role === 'organizer' ? 'member' : 'organizer')}
                      className="rounded-[5px] px-2 py-1 text-xs text-[#3B6D11] hover:bg-[#F5F1ED] transition-colors"
                      title={member.role === 'organizer' ? 'Demote to member' : 'Promote to organizer'}
                    >
                      {member.role === 'organizer' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id, displayName)}
                      className="rounded-[5px] px-2 py-1 text-xs text-[#8B4444] hover:bg-red-50 transition-colors"
                      title="Remove from trip"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[#6B6460]">Pending Invites</h4>
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-[5px] border border-dashed border-[#DAD2BC] bg-white p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DAD2BC]">
                  <span className="text-sm font-semibold text-[#6B6460]">
                    {(invite.name || invite.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[#1C1A17]">
                    {invite.name || invite.email}
                  </p>
                  {invite.name && (
                    <p className="text-sm text-[#6B6460]">{invite.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  invited
                </span>
                {isOrganizer && (
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="rounded-[5px] px-2 py-1 text-xs text-[#8B4444] hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {members.length === 0 && pendingInvites.length === 0 && (
        <div className="rounded-[5px] border border-dashed border-[#DAD2BC] p-8 text-center">
          <p className="text-sm text-[#6B6460]">No members yet. Share the invite link to get started!</p>
        </div>
      )}
    </div>
  )
}
