'use client'

import { createContext, useContext, type ReactNode } from 'react'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tabs components must be used within <Tabs>')
  return context
}

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        overflowX: 'auto',
        background: '#F5F1ED',
        borderBottom: '0.5px solid #D6CFC8',
        scrollbarWidth: 'none',
      }}
      className={className}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabs()
  const isActive = activeValue === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0.85rem 0',
        marginRight: '1.25rem',
        fontFamily: 'var(--sans)',
        fontSize: '13px',
        fontWeight: isActive ? 500 : 400,
        color: isActive ? '#2C2A26' : '#888780',
        background: 'none',
        border: 'none',
        borderBottom: isActive ? '1.5px solid #2C2A26' : '1.5px solid transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'color 0.15s',
        marginBottom: '-0.5px',
      }}
      className={className}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { value: activeValue } = useTabs()
  if (activeValue !== value) return null

  return (
    <div role="tabpanel" className={className} style={{ paddingTop: '24px' }}>
      {children}
    </div>
  )
}
