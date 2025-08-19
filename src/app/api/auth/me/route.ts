import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        console.log('JWT Debug Info:')
        console.log('- Token from cookies:', token?.value ? 'Present' : 'Not found')
        console.log('- Token length:', token?.value?.length || 0)
        if (token?.value) {
            console.log('- Token starts with:', token.value.substring(0, 20) + '...')
        }

        if (!token?.value) {
            console.log('No JWT token found')
            return NextResponse.json({ authenticated: false }, { status: 200 })
        }

        try {
            const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string }
            console.log('JWT verified successfully, userId:', decoded.userId)
            return NextResponse.json({ authenticated: true, userId: decoded.userId }, { status: 200 })
        } catch (e) {
            console.log('JWT verification failed:', e)
            return NextResponse.json({ authenticated: false }, { status: 200 })
        }
    } catch (error) {
        console.log('Error in /api/auth/me:', error)
        return NextResponse.json({ authenticated: false }, { status: 200 })
    }
} 