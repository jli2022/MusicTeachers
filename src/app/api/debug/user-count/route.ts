import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
        createdAt: true
      },
      take: 10
    })
    
    return NextResponse.json({
      totalUsers: userCount,
      recentUsers: users
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get user count',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}