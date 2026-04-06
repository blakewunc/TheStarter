'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBrand } from '@/lib/BrandProvider'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const brand = useBrand()
  const [user, setUser] = useState<any>(null)

  const isBackNine = brand.id === 'backNine'

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
    // The Starter — dark ink navbar matching HTML mockup
    return (
      <nav style={{
        background: 'var(--ink)',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '0.5px solid rgba(245,241,237,0.08)',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--ink)" strokeWidth="1.5">
              <circle cx="7" cy="4.5" r="2.2" />
              <path d="M2.5 12c0-2.5 2-4.5 4.5-4.5S11.5 9.5 11.5 12" />
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--serif)',
            fontSize: '19px',
            fontWeight: 400,
            color: 'var(--cream)',
            letterSpacing: '0.02em',
          }}>
            The Starter
          </span>
        </Link>

        {/* Center links */}
        {user && (
          <div style={{ display: 'flex', gap: '28px' }}>
            <Link
              href="/trips"
              style={{
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: isActive('/trips') ? 'var(--cream)' : 'rgba(245,241,237,0.45)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              My golf trips
            </Link>
            <Link
              href="/my-group"
              style={{
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: pathname.startsWith('/my-group') ? 'var(--cream)' : 'rgba(245,241,237,0.45)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              My group
            </Link>
            <Link
              href="/blog"
              style={{
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: pathname.startsWith('/blog') ? 'var(--cream)' : 'rgba(245,241,237,0.45)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Blog
            </Link>
            <Link
              href="/trips/new"
              style={{
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: isActive('/trips/new') ? 'var(--cream)' : 'rgba(245,241,237,0.45)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Plan a trip
            </Link>
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '12px', color: 'rgba(245,241,237,0.38)' }}>
                {user.email}
              </span>
              <Link
                href="/settings"
                style={{ fontSize: '12px', letterSpacing: '0.05em', color: 'rgba(245,241,237,0.45)', textDecoration: 'none' }}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                style={{ fontSize: '12px', letterSpacing: '0.05em', color: 'rgba(245,241,237,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{ fontSize: '12px', letterSpacing: '0.05em', color: 'rgba(245,241,237,0.45)', textDecoration: 'none' }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  color: 'var(--ink)',
                  background: 'var(--cream)',
                  padding: '7px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
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
