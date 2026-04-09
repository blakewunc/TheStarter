'use client'

import { useState } from 'react'
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

interface PeopleBarProps {
  tripId: string
  members: Member[]
  currentUserId: string | null
  inviteCode: string
}

const AVATAR_COLORS = ['#70798C', '#3B6D11', '#5A7A6B', '#8B7355', '#7C6B8E']

export function PeopleBar({ tripId, members, currentUserId, inviteCode }: PeopleBarProps) {
  const [updating, setUpdating] = useState(false)

  const currentMember = members.find((m) => m.profiles.id === currentUserId)
  const currentStatus = currentMember?.rsvp_status || 'pending'

  const goingCount = members.filter((m) => m.rsvp_status === 'accepted').length
  const maybeCount = members.filter((m) => m.rsvp_status === 'maybe').length
  const pendingCount = members.filter((m) => m.rsvp_status === 'pending').length

  const updateRsvp = async (newStatus: string) => {
    if (newStatus === currentStatus) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp_status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update RSVP')
      toast.success(
        newStatus === 'accepted' ? 'Marked as going!' :
        newStatus === 'maybe' ? 'Marked as maybe' : "Marked as can't go"
      )
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

  const maxAvatars = 7
  const displayMembers = members.slice(0, maxAvatars)
  const extraCount = members.length - maxAvatars

  // RSVP pill styles
  const pillBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: '20px',
    fontFamily: 'var(--sans)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
  }

  const pillStyles = {
    accepted: {
      active: { background: '#EAF3DE', color: '#3B6D11', outline: '1.5px solid #97C459' } as React.CSSProperties,
      inactive: { background: 'transparent', color: '#888780', outline: '1px solid #D6CFC8' } as React.CSSProperties,
    },
    maybe: {
      active: { background: '#FAEEDA', color: '#854F0B', outline: '1.5px solid #FAC775' } as React.CSSProperties,
      inactive: { background: 'transparent', color: '#888780', outline: '1px solid #D6CFC8' } as React.CSSProperties,
    },
    declined: {
      active: { background: '#FDE8E8', color: '#8B4444', outline: '1.5px solid #F3B8B8' } as React.CSSProperties,
      inactive: { background: 'transparent', color: '#888780', outline: '1px solid #D6CFC8' } as React.CSSProperties,
    },
  }

  return (
    <div style={{
      borderTop: '0.5px solid #D6CFC8',
      paddingTop: '16px',
      paddingBottom: '4px',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* Left: Avatar stack + counts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex', marginRight: '4px' }}>
            {displayMembers.map((member, i) => {
              const name = member.profiles.display_name || member.profiles.email.split('@')[0]
              return (
                <div
                  key={member.id}
                  title={name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    border: '2px solid #F5F1ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: i === 0 ? 0 : '-8px',
                    zIndex: displayMembers.length - i,
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', fontFamily: 'var(--sans)' }}>
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            })}
            {extraCount > 0 && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#EAE6E1',
                border: '2px solid #F5F1ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-8px',
                zIndex: 0,
                position: 'relative',
              }}>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#888780', fontFamily: 'var(--sans)' }}>+{extraCount}</span>
              </div>
            )}
          </div>

          {/* RSVP counts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--sans)', fontSize: '12px', color: '#888780' }}>
            {goingCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B6D11', display: 'inline-block' }} />
                {goingCount} going
              </span>
            )}
            {maybeCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FAC775', display: 'inline-block' }} />
                {maybeCount} maybe
              </span>
            )}
            {pendingCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D6CFC8', display: 'inline-block' }} />
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>

        {/* Right: RSVP buttons + Invite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentMember && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#888780', marginRight: '2px' }}>Your RSVP</span>
              <button
                onClick={() => updateRsvp('accepted')}
                disabled={updating}
                style={{
                  ...pillBase,
                  ...(currentStatus === 'accepted' ? pillStyles.accepted.active : pillStyles.accepted.inactive),
                }}
              >
                Going {currentStatus === 'accepted' && '✓'}
              </button>
              <button
                onClick={() => updateRsvp('maybe')}
                disabled={updating}
                style={{
                  ...pillBase,
                  ...(currentStatus === 'maybe' ? pillStyles.maybe.active : pillStyles.maybe.inactive),
                }}
              >
                Maybe
              </button>
              <button
                onClick={() => updateRsvp('declined')}
                disabled={updating}
                style={{
                  ...pillBase,
                  ...(currentStatus === 'declined' ? pillStyles.declined.active : pillStyles.declined.inactive),
                }}
              >
                Can&apos;t go
              </button>
            </div>
          )}

          <button
            onClick={copyInviteLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              background: 'transparent',
              border: '1px dashed #D6CFC8',
              borderRadius: '6px',
              fontFamily: 'var(--sans)',
              fontSize: '11px',
              color: '#888780',
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 2a2 2 0 110 4M4 8a4 4 0 014-4M4 8a4 4 0 00-4 4h8a4 4 0 00-4-4z" />
            </svg>
            Invite +
          </button>
        </div>
      </div>
    </div>
  )
}
