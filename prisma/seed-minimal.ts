// Minimal seed script for build-time (no approval system fields)
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal database seed...')

  // Skip seeding during build if no DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.log('ℹ️  No DATABASE_URL found, skipping seed (build environment)')
    return
  }

  // Create basic admin user without approval fields
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@musicteachers.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Admin User'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: 'ADMIN',
        password: hashedPassword,
        isActive: true,
        emailVerified: new Date()
      }
    })

    console.log(`✅ Created admin user: ${adminUser.email}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  console.log('🌱 Minimal database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })