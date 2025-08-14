import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Prevent employer signup through public endpoint
    if (role === 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Employer accounts must be created by an administrator' },
        { status: 403 }
      )
    }

    // Only allow TEACHER role for public signup
    if (role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

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

    // Create user with TEACHER role only
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true
      }
    })

    // Create teacher profile
    await prisma.teacher.create({
      data: {
        userId: user.id
      }
    })

    return NextResponse.json(
      { message: 'Teacher account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}