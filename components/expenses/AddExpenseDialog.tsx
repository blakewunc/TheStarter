'use client'

import { useState } from 'react'
import { toDateString } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'

interface Member {
  id: string
  name: string
}

interface AddExpenseDialogProps {
  tripId: string
  members: Member[]
  currentUserId: string
  onSuccess: () => void
}

export function AddExpenseDialog({ tripId, members, currentUserId, onSuccess }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: toDateString(new Date()),
    paid_by: currentUserId,
    split_type: 'equal' as 'equal' | 'custom',
  })
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate custom splits if needed
      if (formData.split_type === 'custom') {
        const totalSplit = Object.values(customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
        if (Math.abs(totalSplit - parseFloat(formData.amount)) > 0.01) {
          alert(`Splits must add up to $${formData.amount}. Currently: $${totalSplit.toFixed(2)}`)
          setLoading(false)
          return
        }
      }

      const body: any = {
        ...formData,
        split_type: formData.split_type,
      }

      if (formData.split_type === 'custom') {
        body.custom_splits = Object.entries(customSplits).map(([userId, amount]) => ({
          user_id: userId,
          amount: parseFloat(amount) || 0,
        }))
      }

      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add expense')
      }

      // Reset form and close dialog
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: toDateString(new Date()),
        paid_by: currentUserId,
        split_type: 'equal',
      })
      setCustomSplits({})
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Expense</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-[#252323]">Add Expense</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                  Description*
                </label>
                <Input
                  required
                  placeholder="e.g., Dinner at Nobu"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Amount*
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Category
                  </label>
                  <Input
                    placeholder="e.g., Food"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Date*
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Paid By*
                  </label>
                  <select
                    required
                    value={formData.paid_by}
                    onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
                    className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-[#252323]"
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                  Split Type*
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.split_type === 'equal' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, split_type: 'equal' })}
                    className="flex-1"
                  >
                    Equal Split
                  </Button>
                  <Button
                    type="button"
                    variant={formData.split_type === 'custom' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, split_type: 'custom' })}
                    className="flex-1"
                  >
                    Custom Split
                  </Button>
                </div>
              </div>

              {formData.split_type === 'custom' && (
                <div className="rounded-lg border border-[#DAD2BC] bg-[#F5F1ED] p-4">
                  <p className="mb-3 text-sm font-medium text-[#252323]">Enter amount for each person:</p>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-[#252323]">{member.name}</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={customSplits[member.id] || ''}
                          onChange={(e) => setCustomSplits({ ...customSplits, [member.id]: e.target.value })}
                          className="w-24"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  )
}
