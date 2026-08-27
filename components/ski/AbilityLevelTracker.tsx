'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface AbilityLevelTrackerProps {
  tripId: string
}

interface Ability {
  id: string
  user_id: string
  ability_level: string
  ski_or_snowboard: string
  user_name: string
}

export function AbilityLevelTracker({ tripId }: AbilityLevelTrackerProps) {
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [myAbility, setMyAbility] = useState<Ability | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      await fetchAbilities()
    }

    init()
  }, [tripId])

  async function fetchAbilities() {
    try {
      const response = await fetch(`/api/trips/${tripId}/ski/abilities`)
      if (response.ok) {
        const data = await response.json()
        setAbilities(data.abilities || [])

        // Find current user's ability
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const mine = data.abilities?.find((a: Ability) => a.user_id === user.id)
          setMyAbility(mine || null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch abilities:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      ability_level: formData.get('ability_level') as string,
      ski_or_snowboard: formData.get('ski_or_snowboard') as string,
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/ski/abilities`, {
        method: myAbility ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchAbilities()
      }
    } catch (error) {
      console.error('Failed to save ability:', error)
    } finally {
      setSaving(false)
    }
  }

  // Group by ability level
  const grouped = abilities.reduce((acc, ability) => {
    if (!acc[ability.ability_level]) {
      acc[ability.ability_level] = []
    }
    acc[ability.ability_level].push(ability)
    return acc
  }, {} as Record<string, Ability[]>)

  if (loading) {
    return <p className="text-sm text-[#6B6460]">Loading...</p>
  }

  return (
    <div className="space-y-6">
      {/* My Ability Level */}
      <div>
        <h4 className="font-medium text-[#1C1A17] mb-3">My Ability Level</h4>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ski_or_snowboard">Ski or Snowboard*</Label>
            <select
              id="ski_or_snowboard"
              name="ski_or_snowboard"
              className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#1C1A17] transition-all duration-200 focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17] focus:ring-opacity-15"
              defaultValue={myAbility?.ski_or_snowboard || 'ski'}
              required
            >
              <option value="ski">Ski</option>
              <option value="snowboard">Snowboard</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ability_level">Ability Level*</Label>
            <select
              id="ability_level"
              name="ability_level"
              className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#1C1A17] transition-all duration-200 focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17] focus:ring-opacity-15"
              defaultValue={myAbility?.ability_level || 'intermediate'}
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Ability Level'}
          </Button>
        </form>
      </div>

      {/* Grouped by Level */}
      {abilities.length > 0 && (
        <div className="pt-4 border-t border-[#DAD2BC]">
          <h4 className="font-medium text-[#1C1A17] mb-3">Group by Ability</h4>
          <div className="space-y-3">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => {
              const members = grouped[level] || []
              if (members.length === 0) return null

              return (
                <div key={level} className="rounded-[5px] border border-[#DAD2BC] bg-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-[#1C1A17] capitalize">{level}</h5>
                    <span className="text-xs text-[#6B6460]">
                      {members.length} {members.length === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F5F1ED] px-3 py-1 text-sm text-[#1C1A17]"
                      >
                        <span>{member.user_name}</span>
                        <span className="text-xs text-[#6B6460]">
                          {member.ski_or_snowboard === 'ski' && '⛷️'}
                          {member.ski_or_snowboard === 'snowboard' && '🏂'}
                          {member.ski_or_snowboard === 'both' && '⛷️🏂'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
