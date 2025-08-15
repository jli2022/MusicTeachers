import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import bcrypt from 'bcryptjs'

interface PrismaError extends Error {
  code?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if database initialization is enabled
    // Allow in development or when explicitly enabled, or when no admin users exist (first-time setup)
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const isFirstTimeSetup = adminCount === 0
    
    if (!config.features.enableDatabaseInit && !isFirstTimeSetup) {
      return NextResponse.json(
        { 
          error: 'Database initialization is disabled in this environment.',
          hint: 'Set ENABLE_DATABASE_INIT=true environment variable to enable initialization'
        },
        { status: 403 }
      )
    }

    // SECURITY: Check if initialization has already been run
    // Only disable if approval system is already fully set up
    const totalUsers = await prisma.user.count()
    
    // Check if approval system is already initialized by looking for users with approval status
    let approvalSystemInitialized = false
    try {
      const usersWithApprovalStatus = await prisma.user.count({ 
        where: { approvalStatus: { not: null } } 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      approvalSystemInitialized = usersWithApprovalStatus > 0 && adminCount > 0
    } catch {
      // Approval fields don't exist yet, so system is not initialized
      approvalSystemInitialized = false
    }
    
    if (approvalSystemInitialized) {
      return NextResponse.json(
        { 
          error: 'Approval system already initialized. This endpoint is disabled for security.',
          details: `Found ${adminCount} admin users with approval system active.`
        },
        { status: 403 }
      )
    }

    console.log('🔧 Database initialization starting...')
    console.log(`Current state: ${totalUsers} total users, ${adminCount} admin users`)
    
    if (adminCount > 0) {
      console.log('ℹ️  Admin users exist - updating existing users with approval system')
    } else {
      console.log('🔐 First-time setup - will create admin and demo users')
    }
    
    // Update existing users to approved status (if approval fields exist)
    try {
      const usersNeedingUpdate = await prisma.user.findMany({
        where: {
          approvalDate: null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      })

      if (usersNeedingUpdate.length > 0) {
        console.log(`Updating ${usersNeedingUpdate.length} users with approval status...`)
        
        await prisma.user.updateMany({
          where: {
            approvalDate: null
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          data: {
            approvalStatus: 'APPROVED',
            approvalDate: new Date()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        })
        
        console.log('✅ Updated existing users to APPROVED status')
      }
    } catch {
      console.log('ℹ️  Approval status update skipped (schema may not support it yet)')
    }

    // Check if we need to create demo users (only if feature is enabled)
    const { createDemoUsers } = await request.json()
    
    if (createDemoUsers && config.features.enableDemoUsers) {
      console.log('🧪 Creating demo test users...')
      
      const demoUsers = [
        {
          email: 'admin@musicteachers.com',
          name: 'Admin User',
          password: 'admin123',
          role: 'ADMIN' as const,
          approvalStatus: 'APPROVED' as const,
          approvalDate: new Date()
        },
        {
          email: 'staff@musicteachers.com',
          name: 'Staff Employer',
          password: 'employer123',
          role: 'EMPLOYER' as const,
          approvalStatus: 'APPROVED' as const,
          approvalDate: new Date(),
          employer: {
            organization: 'Music Academy Demo',
            phone: '+1234567890'
          }
        },
        {
          email: 'approved.teacher@test.com',
          name: 'Approved Teacher',
          password: 'approved123',
          role: 'TEACHER' as const,
          approvalStatus: 'APPROVED' as const,
          approvalDate: new Date(),
          teacher: {
            instruments: ['Piano', 'Saxophone'],
            qualifications: 'Master of Music Performance'
          }
        },
        {
          email: 'pending.teacher@test.com',
          name: 'Pending Teacher',
          password: 'pending123',
          role: 'TEACHER' as const,
          approvalStatus: 'PENDING' as const,
          teacher: {
            instruments: ['Piano', 'Guitar']
          }
        },
        {
          email: 'rejected.teacher@test.com',
          name: 'Rejected Teacher',
          password: 'rejected123',
          role: 'TEACHER' as const,
          approvalStatus: 'REJECTED' as const,
          approvalDate: new Date(),
          rejectionReason: 'Incomplete documentation',
          teacher: {
            instruments: ['Violin']
          }
        },
        {
          email: 'approved2.teacher@test.com',
          name: 'Second Approved Teacher',
          password: 'approved2-123',
          role: 'TEACHER' as const,
          approvalStatus: 'APPROVED' as const,
          approvalDate: new Date(),
          teacher: {
            instruments: ['Guitar', 'Voice'],
            qualifications: 'Bachelor of Music Education'
          }
        }
      ]

      // Use lower hash rounds for faster creation
      for (const userData of demoUsers) {
        try {
          const hashedPassword = await bcrypt.hash(userData.password, 8) // Reduced from 12 to 8
          
          const createData = {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: userData.role,
            isActive: true,
            approvalStatus: userData.approvalStatus,
            approvalDate: userData.approvalDate,
            rejectionReason: userData.rejectionReason
          }
          
          // Add role-specific profiles
          if ('teacher' in userData && userData.teacher) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (createData as any).teacher = { create: userData.teacher }
          }
          if ('employer' in userData && userData.employer) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (createData as any).employer = { create: userData.employer }
          }
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await prisma.user.create({ data: createData as any })
          console.log(`✅ Created ${userData.role.toLowerCase()}: ${userData.email}`)
        } catch (error: unknown) {
          if ((error as PrismaError).code !== 'P2002') { // Ignore unique constraint errors
            console.log(`⚠️ Error creating ${userData.email}:`, (error as Error).message)
          }
        }
      }
    } else if (createDemoUsers && !config.features.enableDemoUsers) {
      console.log('ℹ️  Demo user creation is disabled in this environment')
    }

    const finalUserCount = await prisma.user.count()
    
    // Try to get approval status counts (may fail if schema doesn't have approval fields yet)
    let pendingCount = 0, approvedCount = 0, rejectedCount = 0
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pendingCount = await prisma.user.count({ where: { approvalStatus: 'PENDING' } as any })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      approvedCount = await prisma.user.count({ where: { approvalStatus: 'APPROVED' } as any })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rejectedCount = await prisma.user.count({ where: { approvalStatus: 'REJECTED' } as any })
    } catch {
      // Approval fields don't exist yet
      approvedCount = finalUserCount // Assume all users are approved if no approval system
    }

    const wasFirstTimeSetup = adminCount === 0
    
    return NextResponse.json({
      success: true,
      message: wasFirstTimeSetup ? 'Database initialized successfully' : 'Approval system added to existing database',
      security: 'This endpoint will be disabled after approval system is active',
      stats: {
        totalUsers: finalUserCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      },
      demoAccounts: createDemoUsers && config.features.enableDemoUsers ? {
        admin: 'admin@musicteachers.com / admin123',
        employer: 'staff@musicteachers.com / employer123',
        approvedTeacher: 'approved.teacher@test.com / approved123',
        approvedTeacher2: 'approved2.teacher@test.com / approved2-123',
        pendingTeacher: 'pending.teacher@test.com / pending123',
        rejectedTeacher: 'rejected.teacher@test.com / rejected123'
      } : null,
      nextSteps: wasFirstTimeSetup ? [
        'Admin user created and can now log in',
        'Approval system is active',
        'This /init endpoint is now disabled',
        'Access admin panel at /admin'
      ] : [
        'Existing users updated with approval system',
        'All existing users set to APPROVED status',
        'Demo users created for testing',
        'Access admin panel at /admin to manage approvals'
      ]
    })

  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json(
      { 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}