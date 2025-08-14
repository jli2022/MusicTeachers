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
      
      // Create pending teacher
      try {
        const pendingPassword = await bcrypt.hash('pending123', 12)
        
        await prisma.user.create({
          data: {
            email: 'pending.teacher@test.com',
            name: 'Pending Teacher',
            password: pendingPassword,
            role: 'TEACHER',
            isActive: true,
            approvalStatus: 'PENDING',
            teacher: {
              create: {
                instruments: ['Piano', 'Guitar'],
                qualifications: 'Bachelor of Music, Teaching Diploma'
              }
            }
          }
        })
        console.log('✅ Created pending test teacher')
      } catch (error: unknown) {
        if ((error as PrismaError).code !== 'P2002') { // Ignore unique constraint errors
          console.log('⚠️ Error creating pending teacher:', (error as Error).message)
        }
      }

      // Create rejected teacher
      try {
        const rejectedPassword = await bcrypt.hash('rejected123', 12)
        
        await prisma.user.create({
          data: {
            email: 'rejected.teacher@test.com',
            name: 'Rejected Teacher',
            password: rejectedPassword,
            role: 'TEACHER',
            isActive: true,
            approvalStatus: 'REJECTED',
            approvalDate: new Date(),
            rejectionReason: 'Incomplete WWC documentation and missing qualifications',
            teacher: {
              create: {
                instruments: ['Violin']
              }
            }
          }
        })
        console.log('✅ Created rejected test teacher')
      } catch (error: unknown) {
        if ((error as PrismaError).code !== 'P2002') { // Ignore unique constraint errors
          console.log('⚠️ Error creating rejected teacher:', (error as Error).message)
        }
      }

      // Create additional approved teacher
      try {
        const approvedPassword = await bcrypt.hash('approved123', 12)
        
        await prisma.user.create({
          data: {
            email: 'approved.teacher@test.com',
            name: 'Approved Teacher',
            password: approvedPassword,
            role: 'TEACHER',
            isActive: true,
            approvalStatus: 'APPROVED',
            approvalDate: new Date(),
            teacher: {
              create: {
                instruments: ['Piano', 'Saxophone', 'Flute'],
                qualifications: 'Master of Music Performance, Advanced Teaching Certification',
                experience: '8+ years teaching experience with students of all ages'
              }
            }
          }
        })
        console.log('✅ Created approved test teacher')
      } catch (error: unknown) {
        if ((error as PrismaError).code !== 'P2002') { // Ignore unique constraint errors
          console.log('⚠️ Error creating approved teacher:', (error as Error).message)
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