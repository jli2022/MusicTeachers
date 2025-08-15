import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, action, rejectionReason } = await request.json()

    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Check if user exists and is pending
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        approvalStatus: true 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((user as any).approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'User is not pending approval' },
        { status: 400 }
      )
    }

    const updateData = {
      approvalStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approvedBy: session.user.id,
      approvalDate: new Date(),
      ...(action === 'reject' && rejectionReason && { rejectionReason })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: updateData as any,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approvalStatus: true,
        approvalDate: true,
        rejectionReason: true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    })

    return NextResponse.json({
      message: `User ${action}d successfully`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}