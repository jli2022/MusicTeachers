import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { config } from '../src/lib/config'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  console.log(`Environment: ${process.env.NODE_ENV}`)
  
  // Skip during build if no DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.log('ℹ️  No DATABASE_URL - skipping seed (build environment)')
    return
  }
  
  console.log(`Demo users enabled: ${config.features.enableDemoUsers}`)

  // Create admin user
  const adminEmail = config.adminUser.email
  const adminPassword = config.adminUser.password
  const adminName = config.adminUser.name

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  let adminUser = null
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin with approval fields if available
    const adminData: any = {
      email: adminEmail,
      name: adminName,
      role: 'ADMIN',
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date()
    }
    
    // Add approval fields if schema supports them
    try {
      adminData.approvalStatus = 'APPROVED'
      adminData.approvalDate = new Date()
    } catch {
      // Schema might not have approval fields yet
    }

    adminUser = await prisma.user.create({
      data: adminData
    })

    console.log(`✅ Created admin user: ${adminUser.email}`)
    if (config.isDevelopment) {
      console.log(`🔐 Admin password: ${adminPassword}`)
    }
    console.log('⚠️  Please change the admin password after first login!')
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
    // Update existing admin to be approved if needed
    try {
      if ((existingAdmin as any).approvalStatus && (existingAdmin as any).approvalStatus !== 'APPROVED') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            approvalStatus: 'APPROVED',
            approvalDate: new Date()
          } as any
        })
        console.log('✅ Updated admin user approval status')
      }
    } catch (error) {
      console.log('ℹ️  Approval status update skipped (schema may not support it yet)')
    }
  }

  // Create demo users only if enabled (development/staging)
  if (config.features.enableDemoUsers) {
    console.log('🧪 Creating demo users for testing...')
    
    const adminUserId = adminUser?.id || existingAdmin?.id

    // Demo users for testing approval workflow
    const demoUsers = [
      {
        email: 'staff@musicteachers.com',
        name: 'Staff Employer',
        password: 'employer123',
        role: 'EMPLOYER' as const,
        approvalStatus: 'APPROVED' as const,
        profile: {
          type: 'employer',
          data: { organization: 'Music Academy Demo', phone: '+1234567890' }
        }
      },
      {
        email: 'approved.teacher@test.com',
        name: 'Approved Teacher',
        password: 'approved123',
        role: 'TEACHER' as const,
        approvalStatus: 'APPROVED' as const,
        profile: {
          type: 'teacher',
          data: { 
            instruments: ['Piano', 'Saxophone'], 
            qualifications: 'Master of Music Performance'
          }
        }
      },
      {
        email: 'approved2.teacher@test.com',
        name: 'Second Approved Teacher',
        password: 'approved2-123',
        role: 'TEACHER' as const,
        approvalStatus: 'APPROVED' as const,
        profile: {
          type: 'teacher',
          data: { 
            instruments: ['Guitar', 'Voice'], 
            qualifications: 'Bachelor of Music Education'
          }
        }
      },
      {
        email: 'pending.teacher@test.com',
        name: 'Pending Teacher',
        password: 'pending123',
        role: 'TEACHER' as const,
        approvalStatus: 'PENDING' as const,
        profile: {
          type: 'teacher',
          data: { instruments: ['Piano', 'Guitar'] }
        }
      },
      {
        email: 'rejected.teacher@test.com',
        name: 'Rejected Teacher',
        password: 'rejected123',
        role: 'TEACHER' as const,
        approvalStatus: 'REJECTED' as const,
        rejectionReason: 'Incomplete documentation',
        profile: {
          type: 'teacher',
          data: { instruments: ['Violin'] }
        }
      }
    ]

    for (const userData of demoUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 8)
        
        const createData: any = {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
          approvalStatus: userData.approvalStatus,
          approvalDate: userData.approvalStatus === 'APPROVED' ? new Date() : null,
          approvedBy: userData.approvalStatus === 'APPROVED' ? adminUserId : null,
          rejectionReason: userData.rejectionReason || null
        }

        if (userData.profile.type === 'teacher') {
          createData.teacher = { create: userData.profile.data }
        } else if (userData.profile.type === 'employer') {
          createData.employer = { create: userData.profile.data }
        }

        await prisma.user.create({ data: createData })
        console.log(`✅ Created demo ${userData.role.toLowerCase()}: ${userData.email}`)
      } else {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`)
      }
    }

    console.log('🧪 Demo users created for approval workflow testing')
  } else {
    console.log('ℹ️  Demo users disabled (production mode)')
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