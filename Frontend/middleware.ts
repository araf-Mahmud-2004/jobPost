import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  id: string
  role: string
  iat: number
  exp: number
}

export function middleware(request: NextRequest) {
  // Get token from Authorization header (set by axios interceptor)
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value

  // Check if trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      // Skip middleware for now - let the client-side auth handle it
      return NextResponse.next()
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // Skip middleware for now - let the client-side auth handle it
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
