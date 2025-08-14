import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        approvedBy: true,
        approvalStatus: true,
        approvalDate: true,
        rejectionReason: true
      },
      orderBy: [
        { approvalStatus: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { email, name, password, role, organization, phone, instruments, qualifications } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as 'TEACHER' | 'EMPLOYER' | 'ADMIN',
        isActive: true,
        approvalStatus: 'APPROVED',
        approvedBy: session.user.id,
        approvalDate: new Date(),
        emailVerified: new Date()
      }
    })

    // Create role-specific profiles
    if (role === 'EMPLOYER') {
      await prisma.employer.create({
        data: {
          userId: user.id,
          organization: organization || null,
          phone: phone || null
        }
      })
    } else if (role === 'TEACHER') {
      // Parse instruments string into array
      const instrumentsArray = instruments ? 
        instruments.split(',').map((inst: string) => inst.trim()).filter(Boolean) : 
        []

      await prisma.teacher.create({
        data: {
          userId: user.id,
          phone: phone || null,
          instruments: instrumentsArray,
          qualifications: qualifications || null
        }
      })
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}