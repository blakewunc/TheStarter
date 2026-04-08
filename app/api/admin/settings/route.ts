import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — fetch all site settings
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Convert array of {key, value} to an object
  const settings: Record<string, any> = {}
  for (const row of data || []) {
    settings[row.key] = row.value
  }

  return NextResponse.json({ settings })
}

// PATCH — upsert one or more settings
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  // body: { key: string, value: any }
  const { key, value } = body

  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
