import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@/generated/prisma'

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

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string }

        const workspaces = await prisma.workspace.findMany({
            include: {
                creator: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ workspaces })
    } catch (error) {
        console.error('Error in GET /api/workspaces:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token?.value) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string }
        console.log('Creating workspace for user:', decoded.userId)

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true }
        })

        console.log('User role:', user?.role)

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        console.log('Request body:', body)

        const { name, location, capacity } = body

        if (!name || !location || !capacity) {
            return NextResponse.json({ error: 'Name, location, and capacity are required' }, { status: 400 })
        }

        console.log('Creating workspace with data:', { name, location, capacity, createdBy: decoded.userId })

        const workspace = await prisma.workspace.create({
            data: {
                name,
                location,
                capacity: parseInt(capacity),
                createdBy: decoded.userId
            },
            include: {
                creator: {
                    select: {
                        email: true
                    }
                }
            }
        })

        console.log('Workspace created successfully:', workspace)

        return NextResponse.json({ workspace }, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/workspaces:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
