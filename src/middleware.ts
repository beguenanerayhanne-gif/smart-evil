import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// In production, JWT_SECRET MUST be set. We never fall back to a known string
// in production because that would allow an attacker to forge admin tokens.
const jwtSecret = process.env.JWT_SECRET

if (process.env.NODE_ENV === 'production' && !jwtSecret) {
  throw new Error(
    '[middleware] JWT_SECRET is not defined. ' +
    'Set it in your Vercel environment variables before deploying.'
  )
}

const SECRET = new TextEncoder().encode(
  jwtSecret || 'default_secret_key_change_me_in_production'
)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Protect all routes under /admin EXCEPT /admin/login
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
