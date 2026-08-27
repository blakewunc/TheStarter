'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface EquipmentRentalsProps {
  tripId: string
}

interface Rental {
  id: string
  user_id: string
  needs_skis: boolean
  needs_snowboard: boolean
  needs_boots: boolean
  needs_helmet: boolean
  boot_size: number | null
  height_cm: number | null
  weight_kg: number | null
  notes: string | null
  user_name: string
}

export function EquipmentRentals({ tripId }: EquipmentRentalsProps) {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [myRental, setMyRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      await fetchRentals()
    }

    init()
  }, [tripId])

  async function fetchRentals() {
    try {
      const response = await fetch(`/api/trips/${tripId}/ski/rentals`)
      if (response.ok) {
        const data = await response.json()
        setRentals(data.rentals || [])

        // Find current user's rental
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const mine = data.rentals?.find((r: Rental) => r.user_id === user.id)
          setMyRental(mine || null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      needs_skis: formData.get('needs_skis') === 'on',
      needs_snowboard: formData.get('needs_snowboard') === 'on',
      needs_boots: formData.get('needs_boots') === 'on',
      needs_helmet: formData.get('needs_helmet') === 'on',
      boot_size: formData.get('boot_size') ? parseFloat(formData.get('boot_size') as string) : null,
      height_cm: formData.get('height_cm') ? parseInt(formData.get('height_cm') as string) : null,
      weight_kg: formData.get('weight_kg') ? parseInt(formData.get('weight_kg') as string) : null,
      notes: formData.get('notes') as string,
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/ski/rentals`, {
        method: myRental ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchRentals()
      }
    } catch (error) {
      console.error('Failed to save rental:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-[#6B6460]">Loading...</p>
  }

  return (
    <div className="space-y-6">
      {/* My Equipment Rentals */}
      <div>
        <h4 className="font-medium text-[#1C1A17] mb-3">My Rental Needs</h4>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_skis"
                defaultChecked={myRental?.needs_skis}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#3B6D11] focus:ring-[#1C1A17]"
              />
              <span className="text-sm text-[#1C1A17]">Need skis</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_snowboard"
                defaultChecked={myRental?.needs_snowboard}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#3B6D11] focus:ring-[#1C1A17]"
              />
              <span className="text-sm text-[#1C1A17]">Need snowboard</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_boots"
                defaultChecked={myRental?.needs_boots}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#3B6D11] focus:ring-[#1C1A17]"
              />
              <span className="text-sm text-[#1C1A17]">Need boots</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_helmet"
                defaultChecked={myRental?.needs_helmet}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#3B6D11] focus:ring-[#1C1A17]"
              />
              <span className="text-sm text-[#1C1A17]">Need helmet</span>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="boot_size">Boot Size (US)</Label>
              <Input
                id="boot_size"
                name="boot_size"
                type="number"
                step="0.5"
                placeholder="e.g., 10.5"
                defaultValue={myRental?.boot_size || ''}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                name="height_cm"
                type="number"
                placeholder="e.g., 175"
                defaultValue={myRental?.height_cm || ''}
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight_kg">Weight (kg)</Label>
            <Input
              id="weight_kg"
              name="weight_kg"
              type="number"
              placeholder="e.g., 75"
              defaultValue={myRental?.weight_kg || ''}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Preferences, special requirements..."
              defaultValue={myRental?.notes || ''}
              disabled={saving}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Rental Info'}
          </Button>
        </form>
      </div>

      {/* Group Summary */}
      {rentals.length > 0 && (
        <div className="pt-4 border-t border-[#DAD2BC]">
          <h4 className="font-medium text-[#1C1A17] mb-3">Group Summary</h4>
          <div className="space-y-2">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="rounded-[5px] border border-[#DAD2BC] bg-white p-3"
              >
                <p className="font-medium text-[#1C1A17] mb-1">{rental.user_name}</p>
                <div className="flex flex-wrap gap-2 text-xs mb-2">
                  {rental.needs_skis && (
                    <span className="rounded-full bg-[#F5F1ED] px-2 py-1 text-[#1C1A17]">
                      Skis
                    </span>
                  )}
                  {rental.needs_snowboard && (
                    <span className="rounded-full bg-[#F5F1ED] px-2 py-1 text-[#1C1A17]">
                      Snowboard
                    </span>
                  )}
                  {rental.needs_boots && (
                    <span className="rounded-full bg-[#F5F1ED] px-2 py-1 text-[#1C1A17]">
                      Boots
                    </span>
                  )}
                  {rental.needs_helmet && (
                    <span className="rounded-full bg-[#F5F1ED] px-2 py-1 text-[#1C1A17]">
                      Helmet
                    </span>
                  )}
                  {!rental.needs_skis && !rental.needs_snowboard && !rental.needs_boots && !rental.needs_helmet && (
                    <span className="text-[#6B6460]">No rentals needed</span>
                  )}
                </div>
                <div className="text-xs text-[#6B6460] space-y-1">
                  {rental.boot_size && <p>Boot: US {rental.boot_size}</p>}
                  {rental.height_cm && <p>Height: {rental.height_cm} cm</p>}
                  {rental.weight_kg && <p>Weight: {rental.weight_kg} kg</p>}
                  {rental.notes && <p className="mt-2">{rental.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
