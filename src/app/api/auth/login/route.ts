import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@/generated/prisma'

export const runtime = 'nodejs'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

console.log('process.env.jwt_secret', process.env.JWT_SECRET);


export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        // console.log('user', user);


        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }



        const isValidPassword = password == user.password
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials pwd' },
                { status: 401 }
            )
        }
        console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined')
            return NextResponse.json(
                { error: 'Secret Not defined' },
                { status: 500 }
            )
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        const response = NextResponse.json(
            { success: true, message: 'Login successful' },
            { status: 200 }
        )

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: error || 'Internal server error' },
            { status: 500 }
        )
    }
}