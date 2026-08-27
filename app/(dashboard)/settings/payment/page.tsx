'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function PaymentSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    venmo_handle: '',
    zelle_email: '',
    cashapp_handle: '',
  })

  useEffect(() => {
    fetchPaymentProfile()
  }, [])

  const fetchPaymentProfile = async () => {
    try {
      const response = await fetch('/api/profile/payment')
      if (!response.ok) {
        throw new Error('Failed to fetch payment profile')
      }
      const data = await response.json()
      setFormData({
        venmo_handle: data.profile?.venmo_handle || '',
        zelle_email: data.profile?.zelle_email || '',
        cashapp_handle: data.profile?.cashapp_handle || '',
      })
    } catch (error: any) {
      console.error('Failed to load payment profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profile/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update payment profile')
      }

      alert('Payment profile updated successfully!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-[#6B6460]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="outline"
          onClick={() => router.push('/trips')}
          className="mb-6"
        >
          ← Back to Trips
        </Button>

        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-[#1C1A17]">Payment Settings</h1>
          <p className="mt-2 text-[#6B6460]">
            Add your payment handles so friends can easily send you money
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Accounts</CardTitle>
            <CardDescription>
              Connect your payment apps for seamless settlements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Venmo */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1C1A17]">
                  Venmo Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6460]">@</span>
                  <Input
                    placeholder="username"
                    value={formData.venmo_handle}
                    onChange={(e) => setFormData({ ...formData, venmo_handle: e.target.value })}
                    className="pl-8"
                  />
                </div>
                <p className="mt-1 text-xs text-[#6B6460]">
                  Your Venmo username (e.g., @john-doe)
                </p>
              </div>

              {/* Zelle */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1C1A17]">
                  Zelle Email or Phone
                </label>
                <Input
                  type="text"
                  placeholder="email@example.com or phone number"
                  value={formData.zelle_email}
                  onChange={(e) => setFormData({ ...formData, zelle_email: e.target.value })}
                />
                <p className="mt-1 text-xs text-[#6B6460]">
                  The email or phone number linked to your Zelle account
                </p>
              </div>

              {/* Cash App */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1C1A17]">
                  Cash App Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6460]">$</span>
                  <Input
                    placeholder="username"
                    value={formData.cashapp_handle}
                    onChange={(e) => setFormData({ ...formData, cashapp_handle: e.target.value })}
                    className="pl-8"
                  />
                </div>
                <p className="mt-1 text-xs text-[#6B6460]">
                  Your Cash App $Cashtag (e.g., $johndoe)
                </p>
              </div>

              {/* Preview */}
              {(formData.venmo_handle || formData.zelle_email || formData.cashapp_handle) && (
                <div className="rounded-[5px] border-2 border-[#3B6D11] bg-[#F5F1ED] p-4">
                  <p className="mb-2 text-sm font-semibold text-[#1C1A17]">Preview:</p>
                  <div className="space-y-1 text-sm text-[#6B6460]">
                    {formData.venmo_handle && (
                      <p>Venmo: @{formData.venmo_handle}</p>
                    )}
                    {formData.zelle_email && (
                      <p>Zelle: {formData.zelle_email}</p>
                    )}
                    {formData.cashapp_handle && (
                      <p>Cash App: ${formData.cashapp_handle}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/trips')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Payment Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
