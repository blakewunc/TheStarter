export type BrandId = 'groupTrip' | 'backNine'

export interface BrandConfig {
  id: BrandId
  name: string
  tagline: string
  description: string
  defaultTripType: string | null
}

export const brands: Record<BrandId, BrandConfig> = {
  groupTrip: {
    id: 'groupTrip',
    name: 'GroupTrip',
    tagline: 'Plan unforgettable group adventures with ease',
    description: 'Collaborative trip planning for groups. Itineraries, budgets, and expenses — all in one place.',
    defaultTripType: null,
  },
  backNine: {
    id: 'backNine',
    name: 'The Back Nine',
    tagline: 'Plan your next golf trip with the boys',
    description: 'Tee times, scorecards, expenses, and itineraries for your golf crew.',
    defaultTripType: 'golf',
  },
}

export function getBrandFromHeader(brandHeader: string | null): BrandConfig {
  if (brandHeader === 'backNine') return brands.backNine
  return brands.groupTrip
}
