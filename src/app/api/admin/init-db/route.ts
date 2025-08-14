import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

interface PrismaError extends Error {
  code?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin or if this is initial setup
    const session = await getServerSession(authOptions)
    
    // Allow initialization if no admin users exist yet OR if user is admin
    const userCount = await prisma.user.count()
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const isInitialSetup = adminCount === 0
    
    console.log(`Database check: ${userCount} total users, ${adminCount} admin users, isInitialSetup: ${isInitialSetup}`)
    
    if (!isInitialSetup && (!session || session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: `Unauthorized. Only admins can initialize database. Found ${adminCount} admin users.` },
        { status: 401 }
      )
    }

    console.log('🔧 Starting database initialization...')
    
    // Update existing users without approval date to be approved
    const usersNeedingUpdate = await prisma.user.findMany({
      where: {
        approvalDate: null
      }
    })

    if (usersNeedingUpdate.length > 0) {
      console.log(`Updating ${usersNeedingUpdate.length} users with approval status...`)
      
      await prisma.user.updateMany({
        where: {
          approvalDate: null
        },
        data: {
          approvalStatus: 'APPROVED',
          approvalDate: new Date()
        }
      })
      
      console.log('✅ Updated existing users to APPROVED status')
    }

    // Check if we need to create demo users
    const { createDemoUsers } = await request.json()
    
    if (createDemoUsers) {
      console.log('🧪 Creating demo test users...')
      
      const demoUsers = [
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
        }
      ]

      // Use lower hash rounds for faster creation
      for (const userData of demoUsers) {
        try {
          const hashedPassword = await bcrypt.hash(userData.password, 8) // Reduced from 12 to 8
          
          await prisma.user.create({
            data: {
              email: userData.email,
              name: userData.name,
              password: hashedPassword,
              role: userData.role,
              isActive: true,
              approvalStatus: userData.approvalStatus,
              approvalDate: userData.approvalDate,
              rejectionReason: userData.rejectionReason,
              teacher: {
                create: userData.teacher
              }
            }
          })
          console.log(`✅ Created ${userData.approvalStatus.toLowerCase()} teacher: ${userData.email}`)
        } catch (error: unknown) {
          if ((error as PrismaError).code !== 'P2002') { // Ignore unique constraint errors
            console.log(`⚠️ Error creating ${userData.email}:`, (error as Error).message)
          }
        }
      }
    }

    const finalUserCount = await prisma.user.count()
    const pendingCount = await prisma.user.count({ where: { approvalStatus: 'PENDING' } })
    const approvedCount = await prisma.user.count({ where: { approvalStatus: 'APPROVED' } })
    const rejectedCount = await prisma.user.count({ where: { approvalStatus: 'REJECTED' } })

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      stats: {
        totalUsers: finalUserCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      },
      demoAccounts: createDemoUsers ? {
        admin: 'admin@musicteachers.com / admin123',
        employer: 'staff@musicteachers.com / employer123',
        approvedTeacher: 'approved.teacher@test.com / approved123',
        pendingTeacher: 'pending.teacher@test.com / pending123',
        rejectedTeacher: 'rejected.teacher@test.com / rejected123'
      } : null
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