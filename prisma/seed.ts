import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {

    const users = [
        {
            email: 'user@example.com',
            password: 'User@123',
            role: 'user'
        },
        {
            email: 'admin@example.com',
            password: 'Admin@123',
            role: 'admin'
        }
    ]

    for (const user of users) {
        await prisma.user.create({
            data: user
        })
    }

    console.log('Seed data inserted successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })