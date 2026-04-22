import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/admin', '/afiliados']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute) {
    const sessionCookie = req.cookies.get('session')?.value
    let session = null
    if (sessionCookie) {
      session = await decrypt(sessionCookie)
    }

    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (path.startsWith('/admin') && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    if (path.startsWith('/afiliados') && session.role !== 'AFFILIATE') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
