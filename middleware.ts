import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const role = session?.user?.role

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute =
    nextUrl.pathname === '/login' || nextUrl.pathname === '/register'

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', nextUrl))
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Protect admin routes - must be logged in and ADMIN
  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Protect dashboard routes - must be logged in
  if (isDashboardRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
}
