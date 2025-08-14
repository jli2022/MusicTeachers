import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    // Simple auth check
    if (key !== 'seed123') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        admin: { email: existingAdmin.email, name: existingAdmin.name }
      })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@musicteachers.com',
        name: 'Platform Admin',
        role: 'ADMIN',
        password: hashedPassword,
        isActive: true,
        emailVerified: new Date()
      }
    })

    // Create a test teacher user
    const teacherPassword = await bcrypt.hash('teacher123', 12)
    
    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@example.com',
        name: 'Test Teacher',
        role: 'TEACHER', 
        password: teacherPassword,
        isActive: true,
        emailVerified: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Users created successfully',
      users: [
        { email: admin.email, role: admin.role },
        { email: teacher.email, role: teacher.role }
      ],
      credentials: {
        admin: { email: 'admin@musicteachers.com', password: 'admin123' },
        teacher: { email: 'teacher@example.com', password: 'teacher123' }
      }
    })
    
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}