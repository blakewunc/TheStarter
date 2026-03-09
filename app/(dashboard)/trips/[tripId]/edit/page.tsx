'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CoverPhotoUpload } from '@/components/trips/CoverPhotoUpload'

interface Trip {
  id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  description: string | null
  budget_total: number | null
  expected_guests: number | null
  cover_image_url: string | null
  status: string
}

export default function EditTripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
    budget_total: '',
    expected_guests: '',
    status: 'planning',
    trip_type: 'general',
  })

  useEffect(() => {
    async function fetchTrip() {
      try {
        const response = await fetch(`/api/trips/${tripId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch trip')
        }
        const data = await response.json()
        setTrip(data.trip)
        setCoverImageUrl(data.trip.cover_image_url || null)

        // Populate form with trip data
        setFormData({
          title: data.trip.title,
          destination: data.trip.destination,
          start_date: data.trip.start_date,
          end_date: data.trip.end_date,
          description: data.trip.description || '',
          budget_total: data.trip.budget_total?.toString() || '',
          expected_guests: data.trip.expected_guests?.toString() || '',
          status: data.trip.status,
          trip_type: data.trip.trip_type || 'general',
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [tripId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const updateData: any = {
        title: formData.title,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        trip_type: formData.trip_type,
        cover_image_url: coverImageUrl,
      }

      if (formData.description) {
        updateData.description = formData.description
      }

      if (formData.budget_total) {
        updateData.budget_total = parseFloat(formData.budget_total)
      }

      if (formData.expected_guests) {
        updateData.expected_guests = parseInt(formData.expected_guests)
      }

      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update trip')
      }

      router.push(`/trips/${tripId}`)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-[#A99985]">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error && !trip) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            {error || 'Trip not found'}
          </div>
          <Button onClick={() => router.push('/trips')} className="mt-4">
            Back to Trips
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#252323]">Edit Trip</h1>
          <p className="text-[#A99985]">Update your trip details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
            <CardDescription>Make changes to your trip</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cover Photo</Label>
                <CoverPhotoUpload
                  tripId={tripId}
                  currentUrl={coverImageUrl}
                  onUpload={setCoverImageUrl}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Vegas Bachelor Party"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Las Vegas, NV"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trip_type">Trip Type</Label>
                <select
                  id="trip_type"
                  value={formData.trip_type}
                  onChange={(e) => setFormData({ ...formData, trip_type: e.target.value })}
                  disabled={submitting}
                  className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#252323] transition-all duration-200 focus:border-[#70798C] focus:outline-none focus:ring-2 focus:ring-[#70798C] focus:ring-opacity-15 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#F5F1ED]"
                >
                  <option value="general">General Trip</option>
                  <option value="golf">Golf Trip</option>
                  <option value="ski">Ski Trip</option>
                  <option value="bachelor_party">Bachelor Party</option>
                  <option value="bachelorette_party">Bachelorette Party</option>
                </select>
                <p className="text-xs text-[#A99985]">
                  Golf and ski trips include sport-specific features
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expected_guests">Expected Guests</Label>
                  <Input
                    id="expected_guests"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.expected_guests}
                    onChange={(e) => setFormData({ ...formData, expected_guests: e.target.value })}
                    placeholder="e.g., 8"
                    disabled={submitting}
                  />
                  <p className="text-xs text-[#A99985]">Used to calculate cost per person</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_total">Estimated Budget (optional)</Label>
                  <Input
                    id="budget_total"
                    type="number"
                    step="0.01"
                    value={formData.budget_total}
                    onChange={(e) => setFormData({ ...formData, budget_total: e.target.value })}
                    placeholder="2500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your trip..."
                  rows={4}
                  disabled={submitting}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/trips/${tripId}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
