'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Expense } from '@/lib/hooks/useExpenses'
import { calculateBalances, calculateSettlements } from '@/lib/utils/balance-calculator'
import { generatePaymentLink, getPaymentAppColor, getPaymentAppName } from '@/lib/utils/payment-links'

interface PaymentProfile {
  venmo_handle: string | null
  zelle_email: string | null
  cashapp_handle: string | null
}

interface BalanceSheetProps {
  expenses: Expense[]
  members: Array<{ id: string; name: string; paymentProfile?: PaymentProfile }>
  currentUserId: string
  tripTitle: string
}

export function BalanceSheet({ expenses, members, currentUserId, tripTitle }: BalanceSheetProps) {
  const balances = calculateBalances(expenses, members)
  const settlements = calculateSettlements(balances)

  const currentUserBalance = balances.find(b => b.userId === currentUserId)

  const handlePayment = (settlement: any, app: 'venmo' | 'zelle' | 'cashapp') => {
    const recipient = members.find(m => m.id === settlement.to)
    if (!recipient?.paymentProfile) return

    let handle = ''
    if (app === 'venmo' && recipient.paymentProfile.venmo_handle) {
      handle = recipient.paymentProfile.venmo_handle
    } else if (app === 'zelle' && recipient.paymentProfile.zelle_email) {
      handle = recipient.paymentProfile.zelle_email
    } else if (app === 'cashapp' && recipient.paymentProfile.cashapp_handle) {
      handle = recipient.paymentProfile.cashapp_handle
    }

    if (!handle) return

    const note = `${tripTitle} - Trip settlement`
    const link = generatePaymentLink({
      app,
      handle,
      amount: settlement.amount,
      note,
    })

    if (link) {
      window.location.href = link
    } else {
      // For Zelle, show the handle in an alert
      alert(`Send $${settlement.amount.toFixed(2)} to ${settlement.toName} via Zelle: ${handle}`)
    }
  }

  const getAvailablePaymentMethods = (userId: string) => {
    const user = members.find(m => m.id === userId)
    if (!user?.paymentProfile) return []

    const methods: Array<'venmo' | 'zelle' | 'cashapp'> = []
    if (user.paymentProfile.venmo_handle) methods.push('venmo')
    if (user.paymentProfile.zelle_email) methods.push('zelle')
    if (user.paymentProfile.cashapp_handle) methods.push('cashapp')
    return methods
  }

  return (
    <div className="space-y-6">
      {/* Your Balance */}
      <Card className="border-2 border-[#3B6D11]">
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
          <CardDescription>Your net position for this trip</CardDescription>
        </CardHeader>
        <CardContent>
          {currentUserBalance && (
            <div className="text-center">
              <p className={`text-4xl font-bold ${
                currentUserBalance.netBalance > 0
                  ? 'text-green-600'
                  : currentUserBalance.netBalance < 0
                    ? 'text-red-600'
                    : 'text-[#6B6460]'
              }`}>
                ${Math.abs(currentUserBalance.netBalance).toFixed(2)}
              </p>
              <p className="mt-2 text-sm text-[#6B6460]">
                {currentUserBalance.netBalance > 0.01
                  ? 'You are owed'
                  : currentUserBalance.netBalance < -0.01
                    ? 'You owe'
                    : 'You\'re all settled up'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Settlements</CardTitle>
          <CardDescription>
            Minimum transactions to settle all debts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-lg font-semibold text-green-600">✓ Everyone is settled up!</p>
              <p className="mt-2 text-sm text-[#6B6460]">No outstanding balances</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement, index) => {
                const isCurrentUserInvolved =
                  settlement.from === currentUserId || settlement.to === currentUserId
                const isCurrentUserPayer = settlement.from === currentUserId
                const paymentMethods = getAvailablePaymentMethods(settlement.to)

                return (
                  <div
                    key={index}
                    className={`rounded-lg border-2 p-4 ${
                      isCurrentUserInvolved
                        ? 'border-[#3B6D11] bg-[#F5F1ED]'
                        : 'border-[#DAD2BC] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1C1A17]">
                          {settlement.fromName}
                          {settlement.from === currentUserId && ' (You)'}
                        </p>
                        <p className="text-xs text-[#6B6460]">pays</p>
                        <p className="text-sm font-medium text-[#1C1A17]">
                          {settlement.toName}
                          {settlement.to === currentUserId && ' (You)'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#1C1A17]">
                          ${settlement.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Payment Buttons - only show if current user is the payer */}
                    {isCurrentUserPayer && paymentMethods.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-[#6B6460]">QUICK PAY:</p>
                        <div className="flex flex-wrap gap-2">
                          {paymentMethods.map((method) => (
                            <Button
                              key={method}
                              size="sm"
                              onClick={() => handlePayment(settlement, method)}
                              className={getPaymentAppColor(method)}
                            >
                              {getPaymentAppName(method)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No payment methods message */}
                    {isCurrentUserPayer && paymentMethods.length === 0 && (
                      <div className="mt-3 rounded bg-gray-100 p-2 text-xs text-[#6B6460]">
                        {settlement.toName} hasn't set up payment methods yet
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Balances */}
      <Card>
        <CardHeader>
          <CardTitle>All Balances</CardTitle>
          <CardDescription>Net position for each member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {balances.map((balance) => (
              <div
                key={balance.userId}
                className="flex items-center justify-between rounded-lg border border-[#DAD2BC] p-3"
              >
                <span className="text-sm font-medium text-[#1C1A17]">
                  {balance.userName}
                  {balance.userId === currentUserId && ' (You)'}
                </span>
                <span className={`text-sm font-bold ${
                  balance.netBalance > 0.01
                    ? 'text-green-600'
                    : balance.netBalance < -0.01
                      ? 'text-red-600'
                      : 'text-[#6B6460]'
                }`}>
                  {balance.netBalance > 0.01 ? '+' : balance.netBalance < -0.01 ? '-' : ''}
                  ${Math.abs(balance.netBalance).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
