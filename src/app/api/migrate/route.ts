import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    // Simple auth check
    if (key !== 'migrate123') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Run database push (creates tables based on schema)
    console.log('Starting database migration...')
    
    // Test connection first
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    console.log('Existing tables:', tables)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tables: tables,
      note: 'Run "prisma db push" locally with production DATABASE_URL to create tables'
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}