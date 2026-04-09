'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBrand } from '@/lib/BrandProvider'
import { brands } from '@/lib/brand'
import { AdSlot } from '@/components/ads/AdSlot'
import { StarterLogo } from '@/components/StarterLogo'

export function Footer() {
  const pathname = usePathname()
  const brand = useBrand()
  const isBackNine = brand.id === 'backNine'

  // Full-page landing uses its own footer.
  // pathname is '/' (browser URL) when middleware rewrites / → /starter
  if (isBackNine && (pathname === '/' || pathname === '/starter')) return null

  // App interior pages (trip detail, trips list, settings) get a minimal cream footer
  const isAppInterior = isBackNine && (
    pathname.startsWith('/trips') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/my-group') ||
    pathname.startsWith('/admin')
  )

  if (isAppInterior) {
    return (
      <footer style={{ borderTop: '0.5px solid #D6CFC8', background: '#F5F1ED', padding: '12px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#888780', margin: 0 }}>
            © {new Date().getFullYear()} The Starter. All rights reserved.
          </p>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#888780', margin: 0 }}>
            A GroupTrip product
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer className={`border-t ${
      isBackNine
        ? 'border-[#B8D4C4] bg-[#092D3D]'
        : 'border-[#DAD2BC] bg-white'
    }`}>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              {isBackNine ? (
                <StarterLogo className="h-10 w-auto" />
              ) : (
                <>
                  <svg className="h-6 w-6 text-[#70798C]" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-2-20v12l10 6-10-18z" />
                  </svg>
                  <span className="text-lg font-bold text-[#1C1A17]">
                    {brand.name}
                  </span>
                </>
              )}
            </div>
            <p className={`mt-2 text-sm ${isBackNine ? 'text-[#B8D4C4]' : 'text-[#A09890]'}`}>
              {brand.description}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h4 className={`text-xs font-semibold uppercase tracking-wide ${isBackNine ? 'text-[#8ECC7A]' : 'text-[#1C1A17]'}`}>
                Product
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/trips" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                    {isBackNine ? 'My Golf Trips' : 'My Trips'}
                  </Link>
                </li>
                <li>
                  <Link href="/trips/new" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                    {isBackNine ? 'Plan a Trip' : 'Create Trip'}
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                    {isBackNine ? 'Golf Trip Guides' : 'Blog'}
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`text-xs font-semibold uppercase tracking-wide ${isBackNine ? 'text-[#8ECC7A]' : 'text-[#1C1A17]'}`}>
                Company
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/about" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A09890] hover:text-[#1C1A17]'}`}>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ad Banner (Back Nine only) */}
        <AdSlot position="footer-banner" className="mt-8" />

        {/* Bottom bar */}
        <div className={`mt-8 border-t pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${isBackNine ? 'border-[#B8D4C4]/20' : 'border-[#F5F1ED]'}`}>
          <p className={`text-xs ${isBackNine ? 'text-[#5A7A6B]' : 'text-[#A09890]'}`}>
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          {/* Brand switcher */}
          <a
            href={brands[brand.otherBrand].domain}
            className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
              isBackNine
                ? 'text-[#5A7A6B] hover:text-[#B8D4C4]'
                : 'text-[#A09890] hover:text-[#1C1A17]'
            }`}
          >
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3l-5 5 5 5M3 8h10" />
            </svg>
            Switch to {brands[brand.otherBrand].name}
          </a>
        </div>
      </div>
    </footer>
  )
}
