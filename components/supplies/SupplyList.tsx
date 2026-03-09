'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SupplyItem } from '@/lib/hooks/useSupplies'

interface SupplyListProps {
  supplies: SupplyItem[]
  currentUserId: string
  tripId: string
  onClaim: (supplyId: string, claim: boolean) => Promise<void>
  onToggleStatus: (supplyId: string, newStatus: 'needed' | 'claimed' | 'packed') => Promise<void>
  onDelete: (supplyId: string) => Promise<void>
}

const CATEGORY_LABELS: Record<string, string> = {
  food_drinks: '🍔 Food & Drinks',
  gear_equipment: '🎒 Gear & Equipment',
  kitchen_cooking: '🍳 Kitchen & Cooking',
  entertainment: '🎮 Entertainment',
  toiletries: '🧴 Toiletries',
  other: '📦 Other',
}

export function SupplyList({
  supplies,
  currentUserId,
  onClaim,
  onToggleStatus,
  onDelete,
}: SupplyListProps) {
  // Group supplies by category
  const groupedSupplies = supplies.reduce((acc, supply) => {
    if (!acc[supply.category]) {
      acc[supply.category] = []
    }
    acc[supply.category].push(supply)
    return acc
  }, {} as Record<string, SupplyItem[]>)

  // Order categories
  const orderedCategories = [
    'food_drinks',
    'gear_equipment',
    'kitchen_cooking',
    'entertainment',
    'toiletries',
    'other',
  ].filter(cat => groupedSupplies[cat])

  const handleClaim = async (supply: SupplyItem) => {
    const isClaimed = supply.claimed_by === currentUserId
    await onClaim(supply.id, !isClaimed)
  }

  const handleStatusCycle = async (supply: SupplyItem) => {
    const statusOrder: Array<'needed' | 'claimed' | 'packed'> = ['needed', 'claimed', 'packed']
    const currentIndex = statusOrder.indexOf(supply.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    await onToggleStatus(supply.id, nextStatus)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'needed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'claimed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'packed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-[#DAD2BC]'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'needed':
        return 'Needed'
      case 'claimed':
        return 'Claimed'
      case 'packed':
        return 'Packed'
      default:
        return status
    }
  }

  if (supplies.length === 0) {
    return (
      <div className="rounded-[5px] border-2 border-dashed border-[#DAD2BC] p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1ED]">
          <svg className="h-6 w-6 text-[#A99985]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#252323]">Packing list is empty</h3>
        <p className="mt-1 text-sm text-[#A99985]">
          Add items so everyone knows what to bring — sunscreen, speakers, golf balls, snacks.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orderedCategories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">
              {CATEGORY_LABELS[category] || category}
            </CardTitle>
            <CardDescription>
              {groupedSupplies[category].filter(s => s.status === 'needed').length} unclaimed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groupedSupplies[category].map((supply) => {
                const isClaimed = supply.claimed_by === currentUserId
                const claimerName = supply.claimed_by_profile
                  ? supply.claimed_by_profile.display_name || supply.claimed_by_profile.email
                  : null

                return (
                  <div
                    key={supply.id}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      supply.status === 'packed'
                        ? 'border-green-200 bg-green-50 opacity-75'
                        : supply.claimed_by === currentUserId
                        ? 'border-[#70798C] bg-pink-50'
                        : 'border-[#DAD2BC] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-[#252323]">
                            {supply.name}
                            {supply.quantity > 1 && (
                              <span className="ml-2 text-sm text-[#A99985]">
                                (x{supply.quantity})
                              </span>
                            )}
                          </h4>
                          <button
                            onClick={() => handleStatusCycle(supply)}
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(supply.status)}`}
                          >
                            {getStatusLabel(supply.status)}
                          </button>
                        </div>

                        {supply.description && (
                          <p className="mt-1 text-sm text-[#A99985]">
                            {supply.description}
                          </p>
                        )}

                        {supply.cost && (
                          <p className="mt-1 text-sm font-medium text-[#252323]">
                            ~${supply.cost.toFixed(2)}
                          </p>
                        )}

                        {claimerName && supply.status !== 'needed' && (
                          <p className="mt-2 text-xs text-[#A99985]">
                            {isClaimed ? 'You claimed this' : `Claimed by ${claimerName}`}
                          </p>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        {supply.status !== 'packed' && (
                          <Button
                            size="sm"
                            variant={isClaimed ? 'outline' : 'default'}
                            onClick={() => handleClaim(supply)}
                            className={
                              isClaimed
                                ? ''
                                : 'bg-[#70798C] hover:bg-[#D01043]'
                            }
                          >
                            {isClaimed ? 'Unclaim' : 'Claim'}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(supply.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
