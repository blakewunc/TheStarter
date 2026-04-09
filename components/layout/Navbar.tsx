'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBrand } from '@/lib/BrandProvider'

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {open ? (
        <>
          <line x1="4" y1="4" x2="16" y2="16" />
          <line x1="16" y1="4" x2="4" y2="16" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="17" y2="6" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="14" x2="17" y2="14" />
        </>
      )}
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const brand = useBrand()
  const [user, setUser] = useState<any>(null)

  const isBackNine = brand.id === 'backNine'
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isBackNine) {
      fetch('/api/admin/settings')
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          const url = data?.settings?.site_logo?.url
          if (url) setLogoUrl(url)
        })
        .catch(() => {})
    }
  }, [isBackNine])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  // Full-page landing uses its own nav.
  if (isBackNine && (pathname === '/' || pathname === '/starter')) return null

  if (isBackNine) {
    // The Starter — cream navbar matching landing page aesthetic
    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?'
    return (
      <>
      <nav style={{
        background: 'var(--cream)',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '0.5px solid #D6CFC8',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="The Starter" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          ) : (
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: '17px',
              fontWeight: 400,
              color: '#2C2A26',
              letterSpacing: '0.02em',
            }}>
              The Starter
            </span>
          )}
        </Link>

        {/* Desktop center links */}
        {user && (
          <div className="hidden md:flex" style={{ gap: '28px' }}>
            {[
              { href: '/trips', label: 'My trips', active: isActive('/trips') },
              { href: '/blog', label: 'Blog', active: pathname.startsWith('/blog') },
              { href: '/trips/new', label: 'Plan a trip', active: isActive('/trips/new') },
            ].map(({ href, label, active }) => (
              <Link key={href} href={href} style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: active ? '#2C2A26' : '#888780', textDecoration: 'none', transition: 'color 0.15s' }}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              {/* User avatar circle */}
              <div
                title={user.email}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#70798C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/settings')}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', fontFamily: 'var(--sans)' }}>
                  {userInitial}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block" style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#888780', textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#F5F1ED', background: '#2C2A26', padding: '7px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
            </>
          )}
          {/* Hamburger — mobile only */}
          {user && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888780', padding: '4px' }}
              aria-label="Menu"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && user && (
        <div
          className="md:hidden"
          style={{ position: 'fixed', top: '52px', left: 0, right: 0, background: '#F5F1ED', borderBottom: '0.5px solid #D6CFC8', zIndex: 49, padding: '12px 0' }}
          onClick={() => setMenuOpen(false)}
        >
          {[
            { href: '/trips', label: 'My trips' },
            { href: '/blog', label: 'Blog' },
            { href: '/trips/new', label: 'Plan a trip' },
            { href: '/settings', label: 'Settings' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ display: 'block', padding: '12px 24px', fontFamily: 'var(--sans)', fontSize: '14px', color: pathname === href ? '#2C2A26' : '#888780', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          <button onClick={handleSignOut} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontFamily: 'var(--sans)', fontSize: '14px', color: '#888780', background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      )}
      </>
    )
  }

  // GroupTrip — original A&K navbar
  return (
    <nav className="sticky top-0 z-50 border-b border-[#DAD2BC] bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-[#70798C]" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-2-20v12l10 6-10-18z" />
            </svg>
            <span className="text-xl font-bold text-[#1C1A17]">{brand.name}</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/trips" className={`hidden text-sm font-medium transition-colors md:block ${isActive('/trips') ? 'text-[#1C1A17]' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                  My Trips
                </Link>
                <Link href="/trips/new" className={`hidden text-sm font-medium transition-colors md:block ${isActive('/trips/new') ? 'text-[#1C1A17]' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                  Create Trip
                </Link>
                <span className="hidden text-sm text-[#A09890] sm:block">{user.email}</span>
                <Link href="/settings" className="text-sm text-[#A09890] hover:text-[#1C1A17] transition-colors">Settings</Link>
                <button onClick={handleSignOut} className="text-sm text-[#A09890] hover:text-[#1C1A17] transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#A09890] hover:text-[#1C1A17] transition-colors">
                  Log In
                </Link>
                <Link href="/signup" className="rounded-[5px] bg-[#1C1A17] px-4 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
