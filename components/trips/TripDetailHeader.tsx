'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, ChevronLeft, Pencil, Trash2, MoreHorizontal, Share2 } from 'lucide-react'

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
  onOpenAI: () => void
}

export function TripDetailHeader({ trip, isOrganizer, onOpenAI }: TripDetailHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-[#70798C]/10 text-[#70798C] border-[#70798C]/20'
      case 'confirmed': return 'bg-[#4A7C59]/10 text-[#4A7C59] border-[#4A7C59]/20'
      case 'completed': return 'bg-[#A99985]/10 text-[#A99985] border-[#A99985]/20'
      case 'cancelled': return 'bg-[#8B4444]/10 text-[#8B4444] border-[#8B4444]/20'
      default: return 'bg-[#70798C]/10 text-[#70798C] border-[#70798C]/20'
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

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Back link + Trip info */}
        <div className="min-w-0 flex-1">
          <button
            onClick={() => router.push('/trips')}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[#A99985] transition-colors hover:text-[#252323]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            My Trips
          </button>

          <h1 className="truncate text-xl font-bold text-[#252323] sm:text-2xl">
            {trip.title}
          </h1>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#A99985]">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {trip.destination}
            </span>
            <span>{startStr}{startYear} - {endStr} ({days} {days === 1 ? 'day' : 'days'})</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusColor(trip.status)}`}>
              {trip.status}
            </span>
            {daysAway >= 0 && (
              <span className="text-xs font-medium text-[#A99985]">
                {getCountdownText()}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpenAI}
            className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#70798C] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A6270]"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Planner</span>
          </button>

          {isOrganizer && (
            <>
              <button
                onClick={() => router.push(`/trips/${trip.id}/edit`)}
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-3 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-[5px] border border-[#DAD2BC] p-2 text-[#A99985] transition-colors hover:bg-[#F5F1ED] hover:text-[#252323]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-[5px] border border-[#DAD2BC] bg-white py-1 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                      <button
                        onClick={copyRecapLink}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#252323] transition-colors hover:bg-[#F5F1ED]"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share Recap
                      </button>
                      <div className="my-1 border-t border-[#F5F1ED]" />
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          handleDelete()
                        }}
                        disabled={isDeleting}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#8B4444] transition-colors hover:bg-[#F5F1ED]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isDeleting ? 'Deleting...' : 'Delete Trip'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
