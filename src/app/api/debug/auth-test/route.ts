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
    
    console.log(`User found: ${user.name}, Role: ${user.role}, Status: ${user.approvalStatus}`)
    
    // Check password
    const passwordValid = user.password ? await bcrypt.compare(password, user.password) : false
    
    console.log(`Password valid: ${passwordValid}`)
    
    // Check approval status
    const approvalCheck = {
      status: user.approvalStatus,
      isPending: user.approvalStatus === 'PENDING',
      isRejected: user.approvalStatus === 'REJECTED',
      isApproved: user.approvalStatus === 'APPROVED'
    }
    
    console.log(`Approval check:`, approvalCheck)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus,
        approvalDate: user.approvalDate,
        rejectionReason: user.rejectionReason,
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