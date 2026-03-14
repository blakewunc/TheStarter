'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Profile {
  email: string
  display_name: string
  phone: string
  handicap: number | null
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingGolf, setSavingGolf] = useState(false)
  const [authProvider, setAuthProvider] = useState<string>('')
  const [profile, setProfile] = useState<Profile>({
    email: '',
    display_name: '',
    phone: '',
    handicap: null,
  })
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        // TEMPORARILY DISABLED for Google AdSense review - re-enable after approval
        // if (!user) {
        //   router.push('/login')
        //   return
        // }
        if (!user) { setLoading(false); return }

        // Detect auth provider
        const provider = user.app_metadata?.provider || 'email'
        setAuthProvider(provider)

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('email, display_name, phone, handicap')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile({
          email: profileData?.email || user.email || '',
          display_name: profileData?.display_name || '',
          phone: profileData?.phone || '',
          handicap: profileData?.handicap ?? null,
        })
      } catch (error: any) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingProfile(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          phone: profile.phone || null,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingPassword(true)

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      setSavingPassword(false)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      setSavingPassword(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) throw error

      toast.success('Password updated successfully')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleGolfSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingGolf(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          handicap: profile.handicap,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Golf preferences saved')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update golf preferences')
    } finally {
      setSavingGolf(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-[#A99985]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#252323]">Settings</h1>
          <p className="text-[#A99985]">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details visible to trip members</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-[#F5F1ED] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#A99985]">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Full Name</Label>
                  <Input
                    id="display_name"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    placeholder="Enter your full name"
                    disabled={savingProfile}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    disabled={savingProfile}
                  />
                  <p className="text-xs text-[#A99985]">
                    Optional - visible to trip organizers
                  </p>
                </div>

                <Button type="submit" disabled={savingProfile} className="w-full">
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                {authProvider === 'google'
                  ? 'You signed in with Google. Set a password to also enable email/password login.'
                  : 'Update your password'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    disabled={savingPassword}
                    minLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    disabled={savingPassword}
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={savingPassword} className="w-full">
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Golf Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Golf Preferences</CardTitle>
              <CardDescription>Your default golf profile used across all trips</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGolfSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="handicap">Handicap Index</Label>
                  <Input
                    id="handicap"
                    type="number"
                    min={0}
                    max={54}
                    value={profile.handicap !== null ? profile.handicap : ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        handicap: e.target.value !== '' ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g. 12"
                    disabled={savingGolf}
                  />
                  <p className="text-xs text-[#A99985]">
                    0 = scratch golfer, 54 = maximum. Used for group assignments on golf trips.
                  </p>
                </div>

                <Button type="submit" disabled={savingGolf} className="w-full">
                  {savingGolf ? 'Saving...' : 'Save Golf Preferences'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#252323]">Sign Out</p>
                  <p className="text-sm text-[#A99985]">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About GroupTrip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#A99985]">
                Version 1.0.0 - Collaborative trip planning for bachelor parties, golf trips, and group getaways.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
