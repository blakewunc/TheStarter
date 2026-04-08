'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthed(!!user)
      setChecking(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError(error.message)
    setLoginLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  if (checking) {
    return <div style={{ minHeight: '100vh', background: '#F5F1ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#A09890', fontSize: '13px' }}>Loading…</p>
    </div>
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F1ED', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '36px', width: '100%', maxWidth: '380px', border: '0.5px solid rgba(28,26,23,0.10)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', marginBottom: '8px' }}>The Starter</p>
          <h1 style={{ fontSize: '22px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '24px' }}>Admin Panel</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#A09890', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus style={{ width: '100%', height: '44px', border: '0.5px solid rgba(28,26,23,0.20)', borderRadius: '5px', padding: '0 12px', fontSize: '14px', color: '#1C1A17', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#A09890', display: 'block', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', height: '44px', border: '0.5px solid rgba(28,26,23,0.20)', borderRadius: '5px', padding: '0 12px', fontSize: '14px', color: '#1C1A17', boxSizing: 'border-box' }} />
            </div>
            {loginError && <p style={{ fontSize: '12px', color: '#8B4444' }}>{loginError}</p>}
            <button type="submit" disabled={loginLoading} style={{ height: '44px', background: '#1C1A17', color: '#F5F1ED', border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              {loginLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/blog', label: 'Blog Posts' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F1ED' }}>
      {/* Admin nav */}
      <div style={{ background: '#1C1A17', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.02em' }}>
            The Starter · Admin
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: '12px', color: pathname.startsWith(href) ? '#F5F1ED' : 'rgba(245,241,237,0.45)', textDecoration: 'none', letterSpacing: '0.04em' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleSignOut} style={{ fontSize: '11px', color: 'rgba(245,241,237,0.40)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
      {children}
    </div>
  )
}
