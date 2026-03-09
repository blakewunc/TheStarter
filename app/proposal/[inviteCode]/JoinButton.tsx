'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface JoinButtonProps {
  inviteCode: string
  size?: 'default' | 'lg'
}

export function JoinButton({ inviteCode, size = 'default' }: JoinButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push(`/invite/${inviteCode}`)
      } else {
        router.push(`/login?next=/invite/${inviteCode}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size={size} onClick={handleJoin} disabled={loading} className={size === 'lg' ? 'px-10' : ''}>
      {loading ? 'Loading...' : 'Join This Trip'}
    </Button>
  )
}
