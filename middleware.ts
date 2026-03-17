import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Detect brand from hostname
  const host = request.headers.get('host') || ''
  const isStarter = host.includes('thestarter')
  const brand = isStarter ? 'starter' : 'groupTrip'

  // Rewrite root path to golf landing page for The Starter domain
  if (isStarter && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/starter'
    const response = NextResponse.rewrite(url)
    response.headers.set('x-brand', brand)
    return response
  }

  // TEMPORARILY redirect auth pages to landing for The Starter during AdSense review
  if (isStarter && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/forgot-password'
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/starter'
    const response = NextResponse.redirect(url)
    response.headers.set('x-brand', brand)
    return response
  }

  // Set brand header and pass through to Supabase session handler
  request.headers.set('x-brand', brand)
  const response = await updateSession(request)
  response.headers.set('x-brand', brand)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
