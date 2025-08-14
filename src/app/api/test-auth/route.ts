import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const email = searchParams.get('email') || 'admin@musicteachers.com'
    const password = searchParams.get('password') || 'admin123'
    
    if (key !== 'test123') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        email
      })
    }

    // Test password
    const passwordMatch = user.password ? await bcrypt.compare(password, user.password) : false

    return NextResponse.json({
      success: true,
      userFound: true,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
      passwordHash: user.password?.substring(0, 20) + '...',
      passwordMatch,
      testPassword: password
    })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}