'use client'

import * as React from 'react'

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

export function Select({ value, onValueChange, disabled, children }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      {children}
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps {
  children?: React.ReactNode
  className?: string
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className }, ref) => {
    const context = React.useContext(SelectContext)
    const [open, setOpen] = React.useState(false)

    if (!context) {
      throw new Error('SelectTrigger must be used within Select')
    }

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={() => setOpen(!open)}
          disabled={context.disabled}
          className={`flex h-11 w-full items-center justify-between rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#1C1A17] transition-all duration-200 focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17] focus:ring-opacity-15 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#F5F1ED] ${className || ''}`}
        >
          <span>{children}</span>
          <svg
            className="h-4 w-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-[5px] border border-[#DAD2BC] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              {React.Children.map(
                React.Children.toArray(children).slice(1),
                (child) => {
                  if (React.isValidElement(child) && child.type === SelectContent) {
                    return React.cloneElement(child, { onClose: () => setOpen(false) } as any)
                  }
                  return null
                }
              )}
            </div>
          </>
        )}
      </div>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

export function SelectValue() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('SelectValue must be used within Select')
  }
  return <>{context.value}</>
}

export interface SelectContentProps {
  children: React.ReactNode
  onClose?: () => void
}

export function SelectContent({ children, onClose }: SelectContentProps) {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('SelectContent must be used within Select')
  }

  return (
    <div className="p-1">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onClose } as any)
        }
        return child
      })}
    </div>
  )
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  onClose?: () => void
}

export function SelectItem({ value, children, onClose }: SelectItemProps) {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('SelectItem must be used within Select')
  }

  const isSelected = context.value === value

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-[5px] px-3 py-2 text-sm text-[#1C1A17] outline-none transition-colors hover:bg-[#F5F1ED] ${
        isSelected ? 'bg-[#F5F1ED] font-medium' : ''
      }`}
      onClick={() => {
        context.onValueChange(value)
        onClose?.()
      }}
    >
      {children}
      {isSelected && (
        <span className="ml-auto">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  )
}
