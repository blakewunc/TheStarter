'use client'

import { useBrand } from '@/lib/BrandProvider'

interface AdSlotProps {
  position: 'sidebar' | 'footer-banner'
  className?: string
}

export function AdSlot({ position, className = '' }: AdSlotProps) {
  const brand = useBrand()

  // Only render ads on The Back Nine
  if (brand.id !== 'backNine') return null

  const dimensions = position === 'sidebar'
    ? 'w-full max-w-[300px] min-h-[250px]'
    : 'w-full min-h-[90px]'

  return (
    <div className={`${dimensions} ${className}`}>
      <div className={`flex items-center justify-center rounded-[5px] border border-dashed ${
        position === 'sidebar'
          ? 'border-[#B8D4C4] bg-[#D8EADF]/50 min-h-[250px]'
          : 'border-[#B8D4C4]/30 bg-[#092D3D]/5 min-h-[90px]'
      }`}>
        <div className="text-center">
          <p className="text-xs font-medium text-[#5A7A6B]/60">Advertisement</p>
          <p className="mt-1 text-[10px] text-[#5A7A6B]/40">
            {position === 'sidebar' ? '300 x 250' : '728 x 90'}
          </p>
        </div>
      </div>
    </div>
  )
}
