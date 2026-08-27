'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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

interface PendingInvite {
  id: string
  email: string
  name: string | null
  created_at: string
}

interface TripMembersCardProps {
  members: Member[]
  inviteCode: string
  tripId: string
  tripTitle: string
  isOrganizer: boolean
}

export function TripMembersCard({ members, inviteCode, tripId, tripTitle, isOrganizer }: TripMembersCardProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addName, setAddName] = useState('')
  const [adding, setAdding] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/invite/${inviteCode}` : ''

  useEffect(() => {
    if (isOrganizer) fetchPendingInvites()
  }, [tripId, isOrganizer])

  const fetchPendingInvites = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members`)
      if (response.ok) {
        const data = await response.json()
        setPendingInvites(data.pendingInvites || [])
      }
    } catch {
      // Silently fail
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied!')
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

      const wasDirectAdd = !!data.member
      const personName = addName.trim() || addEmail.trim()
      const personEmail = addEmail.trim().toLowerCase()

      if (wasDirectAdd) {
        toast.success(`${personName} added to the trip!`)
      } else {
        // Pending invite created - offer to send email
        toast.success(`${personName} added to your list! Send them the invite link.`)

        // Open mailto with pre-filled invite
        const subject = encodeURIComponent(`You're invited to ${tripTitle}!`)
        const body = encodeURIComponent(
          `Hey ${addName.trim() || 'there'}!\n\n` +
          `I'm planning a trip and want you to join. Check out the details and RSVP here:\n\n` +
          `${inviteLink}\n\n` +
          `Sign up with this email (${personEmail}) so it connects to the trip automatically.\n\n` +
          `See you there!`
        )
        window.open(`mailto:${personEmail}?subject=${subject}&body=${body}`, '_self')
      }

      setAddEmail('')
      setAddName('')
      setShowAddForm(false)
      fetchPendingInvites()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setAdding(false)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members/${inviteId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel')
      }
      toast.success('Invite removed')
      fetchPendingInvites()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getRsvpLabel = (status: string) => {
    switch (status) {
      case 'accepted': return { text: 'Going', color: 'text-[#4A7C59]' }
      case 'declined': return { text: 'Not going', color: 'text-[#8B4444]' }
      case 'maybe': return { text: 'Maybe', color: 'text-[#B8956A]' }
      default: return { text: 'Not responded', color: 'text-[#6B6460]' }
    }
  }

  const getInitialBg = (index: number) => {
    const colors = ['bg-[#3B6D11]', 'bg-[#A99985]', 'bg-[#8B7355]', 'bg-[#6B8E7B]', 'bg-[#7C6B8E]']
    return colors[index % colors.length]
  }

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1C1A17]">Trip Members</h3>
        <button
          onClick={copyInviteLink}
          className="text-sm font-medium text-[#3B6D11] transition-colors hover:text-[#1C1A17]"
        >
          Invite More
        </button>
      </div>

      {/* Active Members */}
      <div className="space-y-3">
        {members.map((member, i) => {
          const name = member.profiles.display_name || member.profiles.email.split('@')[0]
          const rsvp = getRsvpLabel(member.rsvp_status)

          return (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${getInitialBg(i)}`}>
                  <span className="text-xs font-semibold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1C1A17]">{name}</span>
                  {member.role === 'organizer' && (
                    <span className="rounded-[4px] bg-[#F5F1ED] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B6460]">
                      Organizer
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  member.rsvp_status === 'accepted' ? 'bg-[#4A7C59]' :
                  member.rsvp_status === 'declined' ? 'bg-[#8B4444]' :
                  member.rsvp_status === 'maybe' ? 'bg-[#B8956A]' : 'bg-[#DAD2BC]'
                }`} />
                <span className={`text-xs font-medium ${rsvp.color}`}>{rsvp.text}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-[#F5F1ED] pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B6460]">Pending</p>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-[#DAD2BC]">
                  <span className="text-xs font-semibold text-[#DAD2BC]">
                    {(invite.name || invite.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-[#6B6460]">{invite.name || invite.email}</span>
                  {invite.name && (
                    <p className="text-[11px] text-[#DAD2BC]">{invite.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-[#B8956A]">Invited</span>
                {isOrganizer && (
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="text-[10px] text-[#6B6460] hover:text-[#8B4444] transition-colors"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Form */}
      {showAddForm ? (
        <form onSubmit={handleAddMember} className="mt-4 space-y-2 rounded-[5px] bg-[#F5F1ED] p-3">
          <input
            type="text"
            placeholder="Name"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-1.5 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email address"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            required
            className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-1.5 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="flex-1 rounded-[5px] bg-[#3B6D11] py-1.5 text-xs font-medium text-white hover:bg-[#2F5A0E] disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add & Send Invite'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-[5px] border border-[#DAD2BC] px-3 py-1.5 text-xs text-[#6B6460] hover:text-[#1C1A17]"
            >
              Cancel
            </button>
          </div>
          <p className="text-[11px] text-[#6B6460]">
            They&apos;ll auto-join when they sign up with this email
          </p>
        </form>
      ) : (
        <button
          onClick={isOrganizer ? () => setShowAddForm(true) : copyInviteLink}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[5px] border border-dashed border-[#DAD2BC] py-2.5 text-sm font-medium text-[#6B6460] transition-colors hover:border-[#3B6D11] hover:text-[#1C1A17]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {isOrganizer ? 'Add Member' : 'Invite More'}
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
