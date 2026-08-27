'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/ui/StatusChip'

interface TripHeaderProps {
  trip: {
    id: string
    title: string
    destination: string
    start_date: string
    end_date: string
    status: string
  }
  isOrganizer: boolean
}

export function TripHeader({ trip, isOrganizer }: TripHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    router.push(`/trips/${trip.id}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete trip')
      }

      router.push('/trips')
    } catch (error: any) {
      alert(error.message || 'Failed to delete trip')
      setIsDeleting(false)
    }
  }

  const formatDateRange = () => {
    // Parse as local date to avoid timezone shift
    const [sy, sm, sd] = trip.start_date.split('-').map(Number)
    const [ey, em, ed] = trip.end_date.split('-').map(Number)
    const start = new Date(sy, sm - 1, sd)
    const end = new Date(ey, em - 1, ed)

    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = start.getFullYear() === end.getFullYear()
      ? end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const startYear = start.getFullYear() !== end.getFullYear()
      ? `, ${start.getFullYear()}`
      : ''

    return `${startStr}${startYear} - ${endStr} (${days} ${days === 1 ? 'day' : 'days'})`
  }

  return (
    <div className="relative overflow-hidden rounded-[5px] border border-[#DAD2BC] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <StatusChip status={trip.status} />
          {isOrganizer && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Edit Trip
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Trip'}
              </Button>
            </div>
          )}
        </div>

        <h1 className="mb-4 text-4xl page-title tracking-tight text-[#1C1A17]">
          {trip.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-[#6B6460]">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-[#3B6D11]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-base font-medium text-[#1C1A17]">{trip.destination}</span>
          </div>

          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-[#3B6D11]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-base">{formatDateRange()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
