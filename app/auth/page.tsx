'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function AuthForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error') === 'callback_failed'
  const supabase = createClient()

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (!error) setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED] p-4">
      <div className="w-full max-w-sm rounded-[5px] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="mb-6">
          <h1 className="font-['Playfair_Display',serif] text-[28px] font-semibold text-[#1C1A17]">
            Welcome.
          </h1>
          <p className="mt-1 text-[14px] text-[#6B6460]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Sign in to continue.
          </p>
        </div>

        {hasError && (
          <div className="mb-4 rounded-[5px] bg-[#FEF2F2] px-3 py-2 text-sm text-[#991B1B]">
            Something went wrong. Try again or use a different method.
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-[5px] border border-[#D4CFC9] bg-white px-4 py-2.5 text-sm font-medium text-[#1C1A17] transition-colors hover:bg-[#F5F1ED]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#DAD2BC]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#6B6460]">or</span>
          </div>
        </div>

        {submitted ? (
          <p className="text-center text-[14px] text-[#3B6D11]">
            Check your inbox. Link expires in 10 minutes.
          </p>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2.5 text-sm text-[#1C1A17] placeholder-[#6B6460] outline-none focus:border-[#3B6D11] focus:ring-0"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[5px] bg-[#3B6D11] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send me a link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]" />}>
      <AuthForm />
    </Suspense>
  )
}
