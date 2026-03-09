'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AddTeeTimeDialogProps {
  tripId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTeeTimeDialog({ tripId, open, onOpenChange }: AddTeeTimeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const date = formData.get('date') as string
    const time = formData.get('time') as string

    // Combine date and time into ISO timestamp
    const teeTime = new Date(`${date}T${time}`).toISOString()

    const data = {
      course_name: formData.get('course_name') as string,
      course_location: formData.get('course_location') as string,
      tee_time: teeTime,
      num_players: parseInt(formData.get('num_players') as string),
      par: parseInt(formData.get('par') as string) || 72,
      notes: formData.get('notes') as string,
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/golf/tee-times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create tee time')
      }

      onOpenChange(false)
      // Reset form
      ;(e.target as HTMLFormElement).reset()
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
            <Label htmlFor="course_name">Course Name*</Label>
            <Input
              id="course_name"
              name="course_name"
              placeholder="e.g., Pebble Beach Golf Links"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="course_location">Location</Label>
              <Input
                id="course_location"
                name="course_location"
                placeholder="e.g., Pebble Beach, CA"
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
                defaultValue="72"
                className="w-20"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date*</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time*</Label>
              <Input
                id="time"
                name="time"
                type="time"
                required
                disabled={loading}
              />
            </div>
          </div>

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
