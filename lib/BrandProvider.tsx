'use client'

import { createContext, useContext } from 'react'
import { type BrandConfig, brands } from './brand'

const BrandContext = createContext<BrandConfig>(brands.groupTrip)

export function useBrand() {
  return useContext(BrandContext)
}

export function BrandProvider({
  brand,
  children,
}: {
  brand: BrandConfig
  children: React.ReactNode
}) {
  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  )
}
