import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const adminEmail = 'admin@musicteachers.com'
    const adminPassword = 'admin123'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        email: adminEmail
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Administrator',
        role: 'ADMIN',
        password: hashedPassword,
        isActive: true,
        emailVerified: new Date()
      }
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
        warning: 'Please change this password after first login!'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}