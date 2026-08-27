'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CoursePicker, type Course } from '@/components/golf/CoursePicker'

interface AddTeeTimeDialogProps {
  tripId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "lat,lng" of the trip destination, used to bias course search. Optional. */
  near?: string | null
}

export function AddTeeTimeDialog({ tripId, open, onOpenChange, near }: AddTeeTimeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [courseName, setCourseName] = useState('')
  const [course, setCourse] = useState<Course | null>(null)

  const reset = () => {
    setCourseName('')
    setCourse(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    // date and time are stored as-is: a calendar day and a wall clock at the venue.
    // No Date object, no UTC conversion, nothing to shift.
    const data = {
      course_id: course?.id ?? null,
      // The typed text always wins. A course that isn't in the table still submits.
      course_name: courseName.trim(),
      address: course?.address ?? (formData.get('course_location') as string) ?? null,
      lat: course?.lat ?? null,
      lng: course?.lng ?? null,
      timezone: course?.timezone ?? null,
      date: formData.get('date') as string,
      time: (formData.get('time') as string) || null,
      num_players: parseInt(formData.get('num_players') as string) || 4,
      par: parseInt(formData.get('par') as string) || course?.par || 72,
      notes: (formData.get('notes') as string) || null,
      booking_confirmation: (formData.get('booking_confirmation') as string) || null,
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/golf/tee-times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create tee time')
      }

      onOpenChange(false)
      form.reset()
      reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Tee Time</DialogTitle>
          <DialogDescription>
            Add a new tee time for your golf trip
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_name">Course*</Label>
            <CoursePicker
              id="course_name"
              value={courseName}
              onChange={setCourseName}
              onSelectCourse={setCourse}
              near={near}
              required
              disabled={loading}
            />
            {course ? (
              <p className="text-xs text-[#A99985]">
                {[course.city, course.state].filter(Boolean).join(', ')}
                {course.address ? ` · ${course.address}` : ''}
              </p>
            ) : (
              <p className="text-xs text-[#A99985]">
                Not finding it? Just type the name — it saves either way.
              </p>
            )}
          </div>

          {/* Only needed when the course wasn't matched; a matched course brings its own address. */}
          {!course && (
            <div className="space-y-2">
              <Label htmlFor="course_location">Location</Label>
              <Input
                id="course_location"
                name="course_location"
                placeholder="e.g., Pebble Beach, CA"
                disabled={loading}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date*</Label>
              <Input id="date" name="date" type="date" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time*</Label>
              <Input id="time" name="time" type="time" required disabled={loading} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="num_players">Number of Players</Label>
              <Input
                id="num_players"
                name="num_players"
                type="number"
                min="1"
                max="4"
                defaultValue="4"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="par">Course Par</Label>
              <Input
                id="par"
                name="par"
                type="number"
                min="60"
                max="80"
                defaultValue={course?.par ?? 72}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_confirmation">Booking confirmation (optional)</Label>
            <Input
              id="booking_confirmation"
              name="booking_confirmation"
              placeholder="Confirmation number"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional details..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Scheduling...' : 'Schedule Tee Time'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
