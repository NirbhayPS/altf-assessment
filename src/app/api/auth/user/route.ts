import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@/generated/prisma'

export const runtime = 'nodejs'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token?.value) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        try {
            const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                }
            })

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }

            return NextResponse.json({
                authenticated: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            }, { status: 200 })

        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
