'use client'

import * as React from 'react'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[5px] border border-[#DAD2BC] bg-white p-4 sm:p-6 shadow-lg"
      >
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 ${className || ''}`}>{children}</div>
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-[#6B6460]">{children}</p>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-end space-x-2">{children}</div>
}
