'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, MoreHorizontal, Share2, FileText, UserPlus } from 'lucide-react'

interface TripDetailHeaderProps {
  trip: {
    id: string
    title: string
    destination: string
    start_date: string
    end_date: string
    status: string
    trip_type: string | null
    invite_code: string
  }
  isOrganizer: boolean
}

export function TripDetailHeader({ trip, isOrganizer }: TripDetailHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const copyInviteLink = () => {
    const url = `${window.location.origin}/invite/${trip.invite_code}`
    navigator.clipboard.writeText(url)
    toast.success('Invite link copied!')
  }

  const copyRecapLink = () => {
    const url = `${window.location.origin}/recap/${trip.invite_code}`
    navigator.clipboard.writeText(url)
    toast.success('Recap link copied!')
    setShowMenu(false)
  }

  // Parse dates as local to avoid timezone shift
  const [sy, sm, sd] = trip.start_date.split('-').map(Number)
  const [ey, em, ed] = trip.end_date.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const daysAway = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const startYear = start.getFullYear() !== end.getFullYear() ? `, ${start.getFullYear()}` : ''

  const getCountdownText = () => {
    if (daysAway < 0) return 'In progress'
    if (daysAway === 0) return 'Starts today!'
    if (daysAway === 1) return 'Tomorrow'
    return `${daysAway} days away`
  }

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'planning':
        return { bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97', label: 'Planning' }
      case 'confirmed':
        return { bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97', label: 'Confirmed' }
      case 'completed':
        return { bg: '#F1EFE8', text: '#5F5E5A', border: '#D6CFC8', label: 'Completed' }
      case 'cancelled':
        return { bg: '#FDE8E8', text: '#8B4444', border: '#F3B8B8', label: 'Cancelled' }
      default:
        return { bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97', label: status }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete trip')
      router.push('/trips')
    } catch (error: any) {
      alert(error.message || 'Failed to delete trip')
      setIsDeleting(false)
    }
  }

  const statusPill = getStatusPill(trip.status)

  return (
    <div style={{ paddingBottom: '4px' }}>
      {/* Breadcrumb */}
      <button
        onClick={() => router.push('/trips')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'var(--sans)',
          fontSize: '11px',
          color: '#888780',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '10px',
          transition: 'color 0.15s',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M7.5 2.5L4 6l3.5 3.5" />
        </svg>
        My trips
      </button>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        {/* Left: Title + meta */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 400,
            color: '#2C2A26',
            lineHeight: 1.1,
            margin: 0,
          }}>
            {trip.title}
          </h1>

          {/* Meta row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            fontFamily: 'var(--sans)',
            fontSize: '13px',
            color: '#888780',
          }}>
            <span>{trip.destination}</span>
            <span style={{ color: '#D6CFC8' }}>·</span>
            <span>{startStr}{startYear} – {endStr}</span>
            <span style={{ color: '#D6CFC8' }}>·</span>
            <span>{days} {days === 1 ? 'day' : 'days'}</span>
            <span style={{ color: '#D6CFC8' }}>·</span>
            {/* Status pill */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '20px',
              border: `0.5px solid ${statusPill.border}`,
              background: statusPill.bg,
              color: statusPill.text,
              fontSize: '11px',
              fontWeight: 500,
            }}>
              {statusPill.label}
            </span>
            {daysAway >= 0 && (
              <>
                <span style={{ color: '#D6CFC8' }}>·</span>
                <span style={{ fontSize: '12px' }}>{getCountdownText()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Invite crew — always visible */}
          <button
            onClick={copyInviteLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#2C2A26',
              color: '#F5F1ED',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--sans)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <UserPlus size={13} />
            <span className="hidden sm:inline">Invite crew</span>
          </button>

          {/* Edit — organizer only */}
          {isOrganizer && (
            <button
              onClick={() => router.push(`/trips/${trip.id}/edit`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                background: 'transparent',
                color: '#5F5E5A',
                border: '0.5px solid #D6CFC8',
                borderRadius: '6px',
                fontFamily: 'var(--sans)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Pencil size={12} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {/* Overflow menu */}
          {isOrganizer && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: 'transparent',
                  border: '0.5px solid #D6CFC8',
                  borderRadius: '6px',
                  color: '#888780',
                  cursor: 'pointer',
                }}
              >
                <MoreHorizontal size={14} />
              </button>

              {showMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMenu(false)} />
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    zIndex: 50,
                    width: '180px',
                    background: '#fff',
                    border: '0.5px solid #D6CFC8',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: '4px 0',
                  }}>
                    <button
                      onClick={() => { setShowMenu(false); router.push(`/trips/${trip.id}/snapshot`) }}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', padding: '8px 14px', fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <FileText size={13} />
                      View Trip Brief
                    </button>
                    <button
                      onClick={copyRecapLink}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', padding: '8px 14px', fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Share2 size={13} />
                      Share Recap
                    </button>
                    <div style={{ borderTop: '0.5px solid #EAE6E1', margin: '4px 0' }} />
                    <button
                      onClick={() => { setShowMenu(false); handleDelete() }}
                      disabled={isDeleting}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', padding: '8px 14px', fontFamily: 'var(--sans)', fontSize: '13px', color: '#8B4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                      {isDeleting ? 'Deleting…' : 'Delete Trip'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
