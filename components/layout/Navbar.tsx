'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
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

  const isStarter = brand.id === 'starter'

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

  return (
    <nav className={`sticky top-0 z-50 border-b shadow-sm ${
      isStarter
        ? 'border-[#B8D4C4] bg-[#092D3D]'
        : 'border-[#DAD2BC] bg-white'
    }`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            {isStarter ? (
              <svg className="h-8 w-8 text-[#8ECC7A]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 2v18M16 20c0 0-6 2-6 6h12c0-4-6-6-6-6z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2l8 5-8 5V2z" fill="currentColor" stroke="none" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-[#70798C]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-2-20v12l10 6-10-18z"/>
              </svg>
            )}
            <span className={`text-xl font-bold ${isStarter ? 'text-white' : 'text-[#252323]'}`}>
              {brand.name}
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            {user && (
              <div className="hidden items-center space-x-6 md:flex">
                <Link
                  href="/trips"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/trips')
                      ? isStarter ? 'text-white' : 'text-[#252323]'
                      : isStarter ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'
                  }`}
                >
                  {isStarter ? 'My Golf Trips' : 'My Trips'}
                </Link>
                <Link
                  href="/trips/new"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/trips/new')
                      ? isStarter ? 'text-white' : 'text-[#252323]'
                      : isStarter ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'
                  }`}
                >
                  {isStarter ? 'Plan a Trip' : 'Create Trip'}
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <span className={`hidden text-sm sm:block ${isStarter ? 'text-[#B8D4C4]' : 'text-[#A99985]'}`}>
                    {user.email}
                  </span>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className={isStarter ? 'text-[#B8D4C4] hover:text-white hover:bg-white/10' : ''}>
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSignOut}
                    className={isStarter ? 'bg-white/10 text-white hover:bg-white/20 border-[#B8D4C4]' : ''}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className={isStarter ? 'text-[#B8D4C4] hover:text-white hover:bg-white/10' : ''}>
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className={isStarter ? 'bg-[#12733C] hover:bg-[#0B442D] text-white' : ''}>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation (only show when authenticated) */}
      {user && (
        <div className={`border-t md:hidden ${isStarter ? 'border-[#B8D4C4]/20' : 'border-[#DAD2BC]'}`}>
          <div className="space-y-1 px-6 py-4">
            <Link
              href="/trips"
              className={`block rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive('/trips')
                  ? isStarter ? 'bg-white/10 text-white' : 'bg-[#F5F1ED] text-[#252323]'
                  : isStarter ? 'text-[#B8D4C4] hover:bg-white/10 hover:text-white' : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
              }`}
            >
              {isStarter ? 'My Golf Trips' : 'My Trips'}
            </Link>
            <Link
              href="/trips/new"
              className={`block rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive('/trips/new')
                  ? isStarter ? 'bg-white/10 text-white' : 'bg-[#F5F1ED] text-[#252323]'
                  : isStarter ? 'text-[#B8D4C4] hover:bg-white/10 hover:text-white' : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
              }`}
            >
              {isStarter ? 'Plan a Trip' : 'Create Trip'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
