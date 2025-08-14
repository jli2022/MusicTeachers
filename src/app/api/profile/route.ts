import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Error fetching teacher profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      name,
      phone,
      address,
      wwcNumber,
      wwcExpiry,
      dateOfBirth,
      instruments,
      qualifications,
      experience
    } = await request.json()

    const teacher = await prisma.teacher.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      )
    }

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: {
          id: session.user.id
        },
        data: {
          name
        }
      })
    }

    // Update teacher profile
    const updatedTeacher = await prisma.teacher.update({
      where: {
        userId: session.user.id
      },
      data: {
        phone,
        address,
        wwcNumber,
        wwcExpiry: wwcExpiry ? new Date(wwcExpiry) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        instruments: instruments || [],
        qualifications,
        experience
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(updatedTeacher)
  } catch (error) {
    console.error('Error updating teacher profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}