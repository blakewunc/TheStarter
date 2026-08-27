'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface TripMember {
  id: string
  role: string
  budget_cap: number | null
  profiles: {
    id: string
    email: string
    display_name: string | null
  }
}

interface BudgetCapsProps {
  tripId: string
  members: TripMember[]
  currentUserId: string | null
  isOrganizer: boolean
}

export function BudgetCaps({ tripId, members, currentUserId, isOrganizer }: BudgetCapsProps) {
  const [editingCap, setEditingCap] = useState(false)
  const [capValue, setCapValue] = useState('')
  const [saving, setSaving] = useState(false)

  const currentMember = members.find((m) => m.profiles.id === currentUserId)

  const handleSaveCap = async () => {
    setSaving(true)
    try {
      const budget_cap = capValue.trim() === '' ? null : parseFloat(capValue)

      if (budget_cap !== null && (isNaN(budget_cap) || budget_cap < 0)) {
        toast.error('Please enter a valid amount')
        return
      }

      const response = await fetch(`/api/trips/${tripId}/members/budget-cap`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget_cap }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to set budget cap')

      toast.success(budget_cap ? `Budget cap set to $${budget_cap.toLocaleString()}` : 'Budget cap removed')
      setEditingCap(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const membersWithCaps = members.filter((m) => m.budget_cap !== null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1C1A17]">Personal Budget Caps</h3>
          <p className="text-sm text-[#6B6460]">
            Set your maximum spend for this trip
          </p>
        </div>
      </div>

      {/* Current user's budget cap */}
      {currentMember && (
        <div className="rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1C1A17]">Your budget cap</p>
              <p className="text-lg font-bold text-[#1C1A17]">
                {currentMember.budget_cap
                  ? `$${currentMember.budget_cap.toLocaleString()}`
                  : 'Not set'}
              </p>
            </div>
            {!editingCap ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCapValue(currentMember.budget_cap?.toString() || '')
                  setEditingCap(true)
                }}
              >
                {currentMember.budget_cap ? 'Edit' : 'Set Cap'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B6460]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="0"
                    value={capValue}
                    onChange={(e) => setCapValue(e.target.value)}
                    className="w-28 rounded-[5px] border border-[#DAD2BC] bg-white py-1.5 pl-7 pr-3 text-sm text-[#1C1A17] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
                  />
                </div>
                <Button size="sm" onClick={handleSaveCap} disabled={saving}>
                  {saving ? '...' : 'Save'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingCap(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All members' caps (visible to organizer, or show summary to all) */}
      {isOrganizer && membersWithCaps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[#6B6460]">Team Budget Caps</h4>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-[5px] border border-[#DAD2BC] bg-white px-4 py-3"
            >
              <span className="text-sm text-[#1C1A17]">
                {member.profiles.display_name || member.profiles.email}
              </span>
              <span className={`text-sm font-medium ${member.budget_cap ? 'text-[#1C1A17]' : 'text-[#6B6460]'}`}>
                {member.budget_cap ? `$${member.budget_cap.toLocaleString()}` : 'No cap set'}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isOrganizer && membersWithCaps.length > 0 && (
        <p className="text-xs text-[#6B6460]">
          {membersWithCaps.length} of {members.length} members have set a budget cap
        </p>
      )}
    </div>
  )
}
