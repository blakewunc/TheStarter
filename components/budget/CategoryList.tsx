'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { calculateEqualSplit, calculateTotalBudget } from '@/lib/utils/split-calculator'
import type { BudgetCategory } from '@/lib/hooks/useBudget'

interface CategoryListProps {
  categories: BudgetCategory[]
  tripId: string
  memberCount: number
  isOrganizer: boolean
  onRefresh: () => void
}

export function CategoryList({
  categories,
  tripId,
  memberCount,
  isOrganizer,
  onRefresh,
}: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    setDeletingId(categoryId)

    try {
      const response = await fetch(`/api/trips/${tripId}/budget/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      onRefresh()
    } catch (error) {
      alert('Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  const getSplitTypeLabel = (category: BudgetCategory) => {
    if (category.split_type === 'equal') {
      const perPerson = calculateEqualSplit(category.estimated_cost, memberCount)
      return `Equal Split · ${formatCurrency(perPerson)} per person`
    }
    if (category.split_type === 'custom') {
      return 'Custom Split'
    }
    return 'Group Expense (not split)'
  }

  const getSplitTypeBadgeColor = (splitType: string) => {
    if (splitType === 'equal') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    if (splitType === 'custom') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  const totalBudget = categories.length > 0 ? calculateTotalBudget(categories) : 0

  if (categories.length === 0) {
    return (
      <div className="rounded-[5px] border-2 border-dashed border-[#DAD2BC] p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1ED]">
          <svg className="h-6 w-6 text-[#A99985]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#252323]">No budget yet</h3>
        <p className="mt-1 text-sm text-[#A99985]">
          Add categories to build your trip budget — lodging, flights, food, activities.
        </p>
        {isOrganizer && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Lodging', 'Flights', 'Food & Drinks', 'Activities', 'Transportation'].map((name) => (
              <span key={name} className="rounded-full border border-[#DAD2BC] px-3 py-1 text-xs text-[#A99985]">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total Budget Summary */}
      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Budget</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totalBudget)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Per Person</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totalBudget / Math.max(memberCount, 1))}
            </p>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {category.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSplitTypeBadgeColor(
                      category.split_type
                    )}`}
                  >
                    {category.split_type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {getSplitTypeLabel(category)}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(category.estimated_cost)}
                  </p>
                </div>

                {isOrganizer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                  >
                    {deletingId === category.id ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </div>

            {/* Custom splits detail */}
            {category.split_type === 'custom' && category.budget_splits.length > 0 && (
              <div className="mt-3 space-y-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Custom Split Breakdown:
                </p>
                {category.budget_splits.map((split) => (
                  <div
                    key={split.id}
                    className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span>
                      {split.profiles.display_name || split.profiles.email}
                    </span>
                    <span className="font-medium">{formatCurrency(split.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
