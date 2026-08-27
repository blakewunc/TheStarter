'use client'

interface BudgetSnapshotCardProps {
  totalEstimated: number
  perPerson: number
  budgetCap?: number | null
  onViewBudget: () => void
  onAddCategory: () => void
}

export function BudgetSnapshotCard({
  totalEstimated,
  perPerson,
  budgetCap,
  onViewBudget,
  onAddCategory,
}: BudgetSnapshotCardProps) {
  const hasData = totalEstimated > 0

  const getStatus = () => {
    if (!hasData) return null
    if (budgetCap && perPerson > budgetCap) return { text: 'Over budget', color: 'text-[#8B4444]', icon: 'warning' }
    return { text: 'Under budget', color: 'text-[#4A7C59]', icon: 'check' }
  }

  const status = getStatus()

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="mb-4 text-lg font-semibold text-[#1C1A17]">Budget Snapshot</h3>

      {!hasData ? (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-[#6B6460]">No budget categories yet</p>
          <button
            onClick={onAddCategory}
            className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#1C1A17] transition-colors hover:bg-[#F5F1ED]"
          >
            Add a category
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6460]">Total Estimated</span>
              <span className="text-xl font-bold text-[#1C1A17]">${totalEstimated.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6460]">Per Person</span>
              <span className="text-xl font-bold text-[#1C1A17]">${Math.round(perPerson).toLocaleString()}</span>
            </div>
            {status && (
              <div className="flex items-center justify-between pt-2 border-t border-[#F5F1ED]">
                <span className="text-sm text-[#6B6460]">Status</span>
                <span className={`flex items-center gap-1.5 text-sm font-medium ${status.color}`}>
                  {status.text}
                  {status.icon === 'check' && (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {status.icon === 'warning' && (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onViewBudget}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#3B6D11] transition-colors hover:text-[#1C1A17]"
          >
            View full budget
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
