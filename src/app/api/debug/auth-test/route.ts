import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log(`🔍 Testing auth for: ${email}`)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: true,
        employer: true
      }
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        email
      })
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(`User found: ${user.name}, Role: ${user.role}, Status: ${(user as any).approvalStatus}`)
    
    // Check password
    const passwordValid = user.password ? await bcrypt.compare(password, user.password) : false
    
    console.log(`Password valid: ${passwordValid}`)
    
    // Check approval status
    const approvalCheck = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: (user as any).approvalStatus,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isPending: (user as any).approvalStatus === 'PENDING',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isRejected: (user as any).approvalStatus === 'REJECTED',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isApproved: (user as any).approvalStatus === 'APPROVED'
    }
    
    console.log(`Approval check:`, approvalCheck)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        approvalStatus: (user as any).approvalStatus,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        approvalDate: (user as any).approvalDate,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rejectionReason: (user as any).rejectionReason,
        hasPassword: !!user.password,
        passwordValid,
        isActive: user.isActive
      },
      approvalCheck,
      debug: {
        passwordProvided: !!password,
        userPasswordExists: !!user.password
      }
    })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Auth test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}