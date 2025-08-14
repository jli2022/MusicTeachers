import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'fix123') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate new hash for admin123
    const newHash = await bcrypt.hash('admin123', 12)
    
    // Update admin user password
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@musicteachers.com' },
      data: { password: newHash }
    })

    // Test the new hash
    const testMatch = await bcrypt.compare('admin123', newHash)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      newHash: newHash.substring(0, 20) + '...',
      testMatch,
      userEmail: updatedUser.email
    })
    
  } catch (error) {
    console.error('Password fix error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}