'use client'

import Link from 'next/link'
import { useBrand } from '@/lib/BrandProvider'
import { AdSlot } from '@/components/ads/AdSlot'

export function Footer() {
  const brand = useBrand()
  const isBackNine = brand.id === 'backNine'

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
                <svg className="h-6 w-6 text-[#8ECC7A]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 2v18M16 20c0 0-6 2-6 6h12c0-4-6-6-6-6z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 2l8 5-8 5V2z" fill="currentColor" stroke="none" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-[#70798C]" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-2-20v12l10 6-10-18z" />
                </svg>
              )}
              <span className={`text-lg font-bold ${isBackNine ? 'text-white' : 'text-[#252323]'}`}>
                {brand.name}
              </span>
            </div>
            <p className={`mt-2 text-sm ${isBackNine ? 'text-[#B8D4C4]' : 'text-[#A99985]'}`}>
              {brand.description}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h4 className={`text-xs font-semibold uppercase tracking-wide ${isBackNine ? 'text-[#8ECC7A]' : 'text-[#252323]'}`}>
                Product
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/trips" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'}`}>
                    {isBackNine ? 'My Golf Trips' : 'My Trips'}
                  </Link>
                </li>
                <li>
                  <Link href="/trips/new" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'}`}>
                    {isBackNine ? 'Plan a Trip' : 'Create Trip'}
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'}`}>
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`text-xs font-semibold uppercase tracking-wide ${isBackNine ? 'text-[#8ECC7A]' : 'text-[#252323]'}`}>
                Legal
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/privacy" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'}`}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={`text-sm transition-colors ${isBackNine ? 'text-[#B8D4C4] hover:text-white' : 'text-[#A99985] hover:text-[#252323]'}`}>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ad Banner (Back Nine only) */}
        <AdSlot position="footer-banner" className="mt-8" />

        {/* Bottom bar */}
        <div className={`mt-8 border-t pt-6 ${isBackNine ? 'border-[#B8D4C4]/20' : 'border-[#F5F1ED]'}`}>
          <p className={`text-xs ${isBackNine ? 'text-[#5A7A6B]' : 'text-[#A99985]'}`}>
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
