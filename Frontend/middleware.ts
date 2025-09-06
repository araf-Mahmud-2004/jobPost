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
  const token = request.cookies.get('token')?.value

  // Check if trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
