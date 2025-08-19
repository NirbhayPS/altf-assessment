import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@/generated/prisma'

export const runtime = 'nodejs'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token?.value) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string }

        const body = await request.json()
        console.log('Booking request body:', body)

        const { workspaceId, date, time, name, phone, email } = body

        if (!workspaceId || !date || !time || !name || !phone || !email) {
            return NextResponse.json({
                error: 'All fields are required: workspaceId, date, time, name, phone, email'
            }, { status: 400 })
        }

        const bookingDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (isNaN(bookingDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
        }

        if (bookingDate < today) {
            return NextResponse.json({ error: 'Cannot book for past dates' }, { status: 400 })
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(time)) {
            return NextResponse.json({ error: 'Invalid time format. Use HH:MM format (e.g., 14:30)' }, { status: 400 })
        }

        const [hours, minutes] = time.split(':').map(Number)
        if (minutes !== 0) {
            return NextResponse.json({ error: 'Booking time must be on the hour (e.g., 14:00, 15:00)' }, { status: 400 })
        }

        const trimmedName = name.trim()
        if (trimmedName.length < 3) {
            return NextResponse.json({ error: 'Full name must be at least 3 characters long' }, { status: 400 })
        }
        if (trimmedName.length > 100) {
            return NextResponse.json({ error: 'Full name cannot exceed 100 characters' }, { status: 400 })
        }

        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
        const phoneRegex = /^\d{10}$/
        if (!phoneRegex.test(cleanPhone)) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId }
        })

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
        }

        const existingBooking = await prisma.booking.findFirst({
            where: {
                workspaceId: workspaceId,
                date: bookingDate,
                time: time
            }
        })

        if (existingBooking) {
            return NextResponse.json({
                error: `This workspace is already booked for ${date} at ${time}. Please choose a different time or date.`
            }, { status: 409 })
        }

        const booking = await prisma.booking.create({
            data: {
                workspaceId: workspaceId,
                userId: decoded.userId,
                date: bookingDate,
                time: time,
                name: trimmedName,
                phone: cleanPhone,
                email: email.trim()
            },
            include: {
                workspace: {
                    select: {
                        name: true,
                        location: true
                    }
                }
            }
        })

        console.log('Booking created successfully:', booking)

        return NextResponse.json({
            message: 'Booking created successfully',
            booking: {
                id: booking.id,
                workspaceName: booking.workspace.name,
                workspaceLocation: booking.workspace.location,
                date: booking.date.toISOString(),
                time: booking.time,
                name: booking.name,
                phone: booking.phone,
                email: booking.email,
                createdAt: booking.createdAt.toISOString()
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Error in POST /api/bookings:', error)


        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json({
                error: 'This workspace is already booked for the selected date and time. Please choose a different time or date.'
            }, { status: 409 })
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token?.value) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string }

        const bookings = await prisma.booking.findMany({
            where: {
                userId: decoded.userId
            },
            include: {
                workspace: {
                    select: {
                        name: true,
                        location: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        // Serialize the bookings to remove non-serializable properties
        const serializedBookings = bookings.map(booking => ({
            id: booking.id,
            workspaceId: booking.workspaceId,
            userId: booking.userId,
            date: booking.date.toISOString(),
            time: booking.time,
            name: booking.name,
            phone: booking.phone,
            email: booking.email,
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString(),
            workspace: booking.workspace
        }))

        return NextResponse.json({ bookings: serializedBookings })
    } catch (error) {
        console.error('Error in GET /api/bookings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
