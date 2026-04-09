'use client'

import { BudgetTab } from './BudgetTab'
import { ExpensesTab } from './ExpensesTab'

interface FinancialsTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function FinancialsTab({ tripId, trip, currentUserId, isOrganizer }: FinancialsTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Budget section */}
      <section>
        <BudgetTab tripId={tripId} trip={trip} currentUserId={currentUserId} isOrganizer={isOrganizer} />
      </section>

      {/* Divider */}
      <div style={{ borderTop: '0.5px solid #D6CFC8' }} />

      {/* Expenses section */}
      <section>
        <ExpensesTab tripId={tripId} trip={trip} currentUserId={currentUserId} isOrganizer={isOrganizer} />
      </section>
    </div>
  )
}
