'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useBrand } from '@/lib/BrandProvider'
import { StarterLogo } from '@/components/StarterLogo'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const brand = useBrand()
  const [user, setUser] = useState<any>(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

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

  // Close switcher on outside click or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSwitcherOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  // Full-page landing uses its own nav
  if (pathname === '/starter') return null

  return (
    <nav className={`sticky top-0 z-50 border-b shadow-sm ${
      isBackNine
        ? 'border-[#B8D4C4] bg-[#092D3D]'
        : 'border-[#DAD2BC] bg-white'
    }`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo/Brand with product switcher */}
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setSwitcherOpen((v) => !v)}
              className="flex items-center space-x-2 transition-opacity hover:opacity-80 focus:outline-none"
              aria-expanded={switcherOpen}
              aria-haspopup="true"
            >
              {isBackNine ? (
                <StarterLogo className="h-12 w-auto" />
              ) : (
                <>
                  <svg className="h-8 w-8 text-[#70798C]" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-2-20v12l10 6-10-18z"/>
                  </svg>
                  <span className="text-xl font-bold text-[#252323]">{brand.name}</span>
                </>
              )}
              <svg
                className={`h-3.5 w-3.5 transition-transform ${isBackNine ? 'text-[#B8D4C4]' : 'text-[#A99985]'} ${switcherOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Product switcher dropdown */}
            {switcherOpen && (
              <div className={`absolute left-0 top-full mt-2 w-56 rounded-[5px] border shadow-[0_4px_16px_rgba(0,0,0,0.15)] z-50 overflow-hidden ${
                isBackNine ? 'border-[#B8D4C4]/30 bg-[#0B442D]' : 'border-[#DAD2BC] bg-white'
              }`}>
                <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-widest ${isBackNine ? 'text-[#5A7A6B]' : 'text-[#A99985]'}`}>
                  Products
                </div>

                <Link
                  href={user ? '/trips' : '/trips/demo'}
                  onClick={() => setSwitcherOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    isBackNine
                      ? 'bg-white/10 text-white'
                      : 'bg-[#F5F1ED] text-[#252323]'
                  }`}
                >
                  <span className="text-base">⛳</span>
                  <div className="flex-1">
                    <p className="font-medium">{user ? 'Golf Trips' : 'See Demo'}</p>
                  </div>
                  <svg className={`h-2.5 w-2.5 ${isBackNine ? 'text-[#8ECC7A]' : 'text-[#4A7C59]'}`} fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setSwitcherOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    isBackNine
                      ? 'text-[#B8D4C4] hover:bg-white/10 hover:text-white'
                      : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
                  }`}
                >
                  <span className="text-base">✍️</span>
                  <p className="font-medium">Golf Trip Guides</p>
                </Link>

                <div className={`border-t ${isBackNine ? 'border-[#B8D4C4]/20' : 'border-[#F5F1ED]'}`} />

                <div className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm opacity-40">
                  <span className="text-base">🎉</span>
                  <div className="flex-1">
                    <p className={`font-medium ${isBackNine ? 'text-[#B8D4C4]' : 'text-[#A99985]'}`}>Group Trips</p>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${isBackNine ? 'bg-white/10 text-[#B8D4C4]' : 'bg-[#F5F1ED] text-[#A99985]'}`}>
                    Soon
                  </span>
                </div>

                <div className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm opacity-40">
                  <span className="text-base">🎿</span>
                  <div className="flex-1">
                    <p className={`font-medium ${isBackNine ? 'text-[#B8D4C4]' : 'text-[#A99985]'}`}>Ski Trips</p>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${isBackNine ? 'bg-white/10 text-[#B8D4C4]' : 'bg-[#F5F1ED] text-[#A99985]'}`}>
                    Soon
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            {user && (
              <div className="hidden items-center space-x-6 md:flex">
                <Link
                  href="/trips"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/trips')
                      ? isBackNine ? 'text-white' : 'text-[#252323]'
                      : isBackNine ? 'text-[#8fa3b1] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'
                  }`}
                >
                  {isBackNine ? 'My golf trips' : 'My Trips'}
                </Link>
                <Link
                  href="/trips/new"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/trips/new')
                      ? isBackNine ? 'text-white' : 'text-[#252323]'
                      : isBackNine ? 'text-[#8fa3b1] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'
                  }`}
                >
                  {isBackNine ? 'Plan a trip' : 'Create Trip'}
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <span className={`hidden text-sm sm:block ${isBackNine ? 'text-[#B8D4C4]' : 'text-[#A99985]'}`}>
                    {user.email}
                  </span>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className={isBackNine ? 'text-[#B8D4C4] hover:text-white hover:bg-white/10' : ''}>
                      Settings
                    </Button>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={isBackNine ? 'text-sm text-[#8fa3b1] hover:text-white transition-colors' : 'text-sm text-[#A99985] hover:text-[#252323] transition-colors'}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className={isBackNine ? 'text-[#B8D4C4] hover:text-white hover:bg-white/10' : ''}>
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className={isBackNine ? 'bg-[#12733C] hover:bg-[#0B442D] text-white' : ''}>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className={`border-t md:hidden ${isBackNine ? 'border-[#B8D4C4]/20' : 'border-[#DAD2BC]'}`}>
        <div className="space-y-1 px-6 py-4">
          {user ? (
            <>
              <Link
                href="/trips"
                className={`block rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/trips')
                    ? isBackNine ? 'bg-white/10 text-white' : 'bg-[#F5F1ED] text-[#252323]'
                    : isBackNine ? 'text-[#8fa3b1] hover:bg-white/10 hover:text-white' : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
                }`}
              >
                {isBackNine ? 'My golf trips' : 'My Trips'}
              </Link>
              <Link
                href="/trips/new"
                className={`block rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/trips/new')
                    ? isBackNine ? 'bg-white/10 text-white' : 'bg-[#F5F1ED] text-[#252323]'
                    : isBackNine ? 'text-[#8fa3b1] hover:bg-white/10 hover:text-white' : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
                }`}
              >
                {isBackNine ? 'Plan a trip' : 'Create Trip'}
              </Link>
            </>
          ) : (
            <Link
              href="/blog"
              className={`block rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive('/blog')
                  ? isBackNine ? 'bg-white/10 text-white' : 'bg-[#F5F1ED] text-[#252323]'
                  : isBackNine ? 'text-[#B8D4C4] hover:bg-white/10 hover:text-white' : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
              }`}
            >
              {isBackNine ? 'Golf Trip Guides' : 'Blog'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
