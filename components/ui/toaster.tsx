'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#1C1A17',
          border: '1px solid #DAD2BC',
          borderRadius: '5px',
          fontSize: '14px',
        },
        className: 'shadow-[0_2px_6px_rgba(0,0,0,0.08)]',
      }}
    />
  )
}
