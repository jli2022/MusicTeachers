import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminEmail = 'admin@musicteachers.com'
  const adminPassword = 'admin123' // Change this in production!

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  let adminUser = null
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Administrator',
        role: 'ADMIN',
        password: hashedPassword,
        isActive: true,
        emailVerified: new Date(),
        approvalStatus: 'APPROVED',
        approvalDate: new Date()
      }
    })

    console.log(`✅ Created admin user: ${adminUser.email}`)
    console.log(`🔐 Admin password: ${adminPassword}`)
    console.log('⚠️  Please change the admin password after first login!')
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  // Create sample teacher (for testing)
  const teacherEmail = 'teacher@example.com'
  const existingTeacher = await prisma.user.findUnique({
    where: { email: teacherEmail }
  })

  if (!existingTeacher) {
    const teacherPassword = await bcrypt.hash('teacher123', 12)

    const teacherUser = await prisma.user.create({
      data: {
        email: teacherEmail,
        name: 'Sample Teacher',
        role: 'TEACHER',
        password: teacherPassword,
        isActive: true,
        emailVerified: new Date(),
        approvalStatus: 'APPROVED',
        approvalDate: new Date()
      }
    })

    await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
        instruments: ['Piano', 'Guitar'],
        qualifications: 'Bachelor of Music Education',
        experience: '5 years of private lessons and school programs'
      }
    })

    console.log(`✅ Created sample teacher: ${teacherUser.email}`)
    console.log(`🔐 Teacher password: teacher123`)
  } else {
    console.log(`ℹ️  Sample teacher already exists: ${teacherEmail}`)
  }

  // Create sample employer (for testing)
  const employerEmail = 'staff@musicteachers.com'
  const existingEmployer = await prisma.user.findUnique({
    where: { email: employerEmail }
  })

  let adminUserId = adminUser?.id || existingAdmin?.id

  if (!existingEmployer) {
    const employerPassword = await bcrypt.hash('employer123', 12)

    const employerUser = await prisma.user.create({
      data: {
        email: employerEmail,
        name: 'Employee',
        role: 'EMPLOYER',
        password: employerPassword,
        isActive: true,
        emailVerified: new Date(),
        approvalStatus: 'APPROVED',
        approvalDate: new Date(),
        approvedBy: adminUserId
      }
    })

    await prisma.employer.create({
      data: {
        userId: employerUser.id,
        organization: 'DL'
      }
    })

    console.log(`✅ Created sample employer: ${employerUser.email}`)
    console.log(`🔐 Employer password: employer123`)
  } else {
    console.log(`ℹ️  Sample employer already exists: ${employerEmail}`)
  }

  console.log('🌱 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })