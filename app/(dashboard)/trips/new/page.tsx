'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBrand } from '@/lib/BrandProvider'

export default function NewTripPage() {
  const router = useRouter()
  const brand = useBrand()
  const isBackNine = brand.id === 'backNine'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      destination: formData.get('destination') as string,
      trip_type: formData.get('trip_type') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      description: formData.get('description') as string,
      budget_total: formData.get('budget_total')
        ? parseFloat(formData.get('budget_total') as string)
        : undefined,
    }

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create trip')
      }

      const { trip } = await response.json()
      router.push(`/trips/${trip.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Create a New Trip</h1>
          <p className="text-[#A99985]">Start planning your next group adventure</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Fill in the basic information about your trip. You can always edit this later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title*</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Bachelor Party in Nashville"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination*</Label>
                <Input
                  id="destination"
                  name="destination"
                  placeholder="e.g., Nashville, TN"
                  required
                  disabled={loading}
                />
              </div>

              {isBackNine && <input type="hidden" name="trip_type" value="golf" />}
              <div className={`space-y-2${isBackNine ? ' hidden' : ''}`}>
                <Label htmlFor="trip_type">Trip Type*</Label>
                {!isBackNine && (
                  <>
                    <select
                      id="trip_type"
                      name="trip_type"
                      className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#252323] transition-all duration-200 focus:border-[#70798C] focus:outline-none focus:ring-2 focus:ring-[#70798C] focus:ring-opacity-15 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#F5F1ED]"
                      required
                      disabled={loading}
                      defaultValue="general"
                    >
                      <option value="general">General Trip</option>
                      <option value="golf">⛳ Golf Trip</option>
                      <option value="ski">⛷️ Ski Trip</option>
                      <option value="bachelor_party">🎉 Bachelor Party</option>
                      <option value="bachelorette_party">💃 Bachelorette Party</option>
                    </select>
                    <p className="text-xs text-[#A99985]">
                      Golf and ski trips include sport-specific features
                    </p>
                  </>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date*</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date*</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_total">Estimated Total Budget (optional)</Label>
                <Input
                  id="budget_total"
                  name="budget_total"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 5000"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add any additional details about the trip..."
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Trip'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
