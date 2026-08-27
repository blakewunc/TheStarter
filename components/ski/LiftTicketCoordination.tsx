'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface LiftTicketCoordinationProps {
  tripId: string
}

interface Ticket {
  id: string
  user_id: string
  ticket_type: string
  num_days: number | null
  purchased: boolean
  cost: number | null
  user_name: string
}

export function LiftTicketCoordination({ tripId }: LiftTicketCoordinationProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [myTicket, setMyTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      await fetchTickets()
    }

    init()
  }, [tripId])

  async function fetchTickets() {
    try {
      const response = await fetch(`/api/trips/${tripId}/ski/tickets`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])

        // Find current user's ticket
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const mine = data.tickets?.find((t: Ticket) => t.user_id === user.id)
          setMyTicket(mine || null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      ticket_type: formData.get('ticket_type') as string,
      num_days: formData.get('num_days') ? parseInt(formData.get('num_days') as string) : null,
      purchased: formData.get('purchased') === 'on',
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/ski/tickets`, {
        method: myTicket ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchTickets()
      }
    } catch (error) {
      console.error('Failed to save ticket:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-[#6B6460]">Loading...</p>
  }

  return (
    <div className="space-y-6">
      {/* My Lift Ticket */}
      <div>
        <h4 className="font-medium text-[#1C1A17] mb-3">My Lift Ticket</h4>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket_type">Ticket Type*</Label>
            <select
              id="ticket_type"
              name="ticket_type"
              className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#1C1A17] transition-all duration-200 focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17] focus:ring-opacity-15"
              defaultValue={myTicket?.ticket_type || 'none'}
              required
            >
              <option value="none">No ticket yet</option>
              <option value="single_day">Single Day</option>
              <option value="multi_day">Multi-Day Pass</option>
              <option value="season_pass">Season Pass</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_days">Number of Days</Label>
            <Input
              id="num_days"
              name="num_days"
              type="number"
              min="1"
              placeholder="e.g., 3"
              defaultValue={myTicket?.num_days || ''}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 250.00"
              defaultValue={myTicket?.cost || ''}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="purchased"
                defaultChecked={myTicket?.purchased}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#3B6D11] focus:ring-[#1C1A17]"
              />
              <span className="text-sm text-[#1C1A17]">Already purchased</span>
            </label>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Ticket Info'}
          </Button>
        </form>
      </div>

      {/* Group Summary */}
      {tickets.length > 0 && (
        <div className="pt-4 border-t border-[#DAD2BC]">
          <h4 className="font-medium text-[#1C1A17] mb-3">Group Summary</h4>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-[5px] border border-[#DAD2BC] bg-white p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[#1C1A17]">{ticket.user_name}</p>
                    <p className="text-sm text-[#6B6460]">
                      {ticket.ticket_type === 'none' && 'No ticket yet'}
                      {ticket.ticket_type === 'single_day' && 'Single Day'}
                      {ticket.ticket_type === 'multi_day' && `${ticket.num_days || '?'} Days`}
                      {ticket.ticket_type === 'season_pass' && 'Season Pass'}
                    </p>
                  </div>
                  <div className="text-right">
                    {ticket.cost && (
                      <p className="text-sm font-medium text-[#1C1A17]">
                        ${ticket.cost.toFixed(2)}
                      </p>
                    )}
                    {ticket.purchased && (
                      <span className="text-xs text-green-600">✓ Purchased</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Cost */}
          <div className="mt-4 rounded-[5px] bg-[#F5F1ED] p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#1C1A17]">Total Group Cost</span>
              <span className="text-lg font-bold text-[#1C1A17]">
                ${tickets.reduce((sum, t) => sum + (t.cost || 0), 0).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-[#6B6460] mt-1">
              {tickets.filter(t => t.purchased).length} / {tickets.length} purchased
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
