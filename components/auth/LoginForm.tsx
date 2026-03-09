'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const next = searchParams.get('next') || '/trips'

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setMessage({ type: 'error', text: result.error.issues[0].message })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.refresh()
      router.push(next)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to sign in' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = signupSchema.safeParse({ email, password, confirmPassword })
    if (!result.success) {
      setMessage({ type: 'error', text: result.error.issues[0].message })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) throw error
      setMessage({
        type: 'success',
        text: 'Check your email to confirm your account!',
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create account' })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) throw error
      setMessage({
        type: 'success',
        text: 'Check your email for the magic link!',
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send magic link' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to sign in with Google' })
      setLoading(false)
    }
  }

  const switchMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription>
          {authMode === 'login'
            ? 'Sign in to continue planning your trips'
            : 'Sign up to start planning your next adventure'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auth Method Toggle */}
        <div className="flex rounded-[5px] border border-[#DAD2BC] p-1">
          <button
            type="button"
            onClick={() => setAuthMethod('password')}
            className={`flex-1 rounded-[3px] px-3 py-2 text-sm font-medium transition-colors ${
              authMethod === 'password'
                ? 'bg-[#70798C] text-white'
                : 'text-[#A99985] hover:text-[#252323]'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('magic-link')}
            className={`flex-1 rounded-[3px] px-3 py-2 text-sm font-medium transition-colors ${
              authMethod === 'magic-link'
                ? 'bg-[#70798C] text-white'
                : 'text-[#A99985] hover:text-[#252323]'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Password Auth Form */}
        {authMethod === 'password' && (
          <form
            onSubmit={authMode === 'login' ? handlePasswordLogin : handlePasswordSignup}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {authMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            {authMode === 'login' && (
              <div className="text-right">
                <a href="/forgot-password" className="text-sm text-[#70798C] hover:underline">
                  Forgot password?
                </a>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Please wait...'
                : authMode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </form>
        )}

        {/* Magic Link Form */}
        {authMethod === 'magic-link' && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-magic">Email</Label>
              <Input
                id="email-magic"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
            <p className="text-center text-xs text-[#A99985]">
              We&apos;ll send a sign-in link to your email
            </p>
          </form>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#DAD2BC]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-[#A99985]">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>

        {/* Message Display */}
        {message && (
          <div
            className={`rounded-[5px] p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-[#A99985]">
          {authMode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="font-medium text-[#252323] hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-medium text-[#252323] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}
