import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname === '/favicon.ico'
    ) {
        console.log('Allowing Next.js internal:', pathname)
        return NextResponse.next()
    }

    const publicPaths = ['/login', '/api/auth/login', '/api/auth/me', '/api/auth/user', '/api/workspaces', '/api/bookings', '/admin/workspaces', '/bookings']
    if (publicPaths.includes(pathname)) {
        console.log('Allowing public path:', pathname)
        return NextResponse.next()
    }

    const token = request.cookies.get('token')
    console.log('Token present:', !!token, 'Token length:', token?.value?.length || 0)

    if (!token) {
        console.log('No token found, redirecting to login')
        if (pathname.startsWith('/api')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    if (!process.env.JWT_SECRET) {
        console.log('JWT_SECRET not available in middleware')
        return NextResponse.next()
    }

    try {
        return NextResponse.next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            const response = pathname.startsWith('/api')
                ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
                : NextResponse.redirect(new URL('/login', request.url))

            response.cookies.set({
                name: 'token',
                value: '',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 0,
                path: '/',
            })

            return response
        } else {
            return NextResponse.next()
        }
    }
}

export const config = {
    matcher: ['/(.*)']
}