import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { isActive } = await request.json()
    const { id: userId } = await params

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    })

    return NextResponse.json({
      message: 'User status updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}