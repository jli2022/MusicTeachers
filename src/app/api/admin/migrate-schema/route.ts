import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔧 Starting database schema migration...')
    
    // Use raw SQL to add the missing columns if they don't exist
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        -- Add ApprovalStatus enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApprovalStatus') THEN
          CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        END IF;
        
        -- Add approvalStatus column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'approvalStatus') THEN
          ALTER TABLE "users" ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';
        END IF;
        
        -- Add approvedBy column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'approvedBy') THEN
          ALTER TABLE "users" ADD COLUMN "approvedBy" TEXT;
        END IF;
        
        -- Add approvalDate column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'approvalDate') THEN
          ALTER TABLE "users" ADD COLUMN "approvalDate" TIMESTAMP(3);
        END IF;
        
        -- Add rejectionReason column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'rejectionReason') THEN
          ALTER TABLE "users" ADD COLUMN "rejectionReason" TEXT;
        END IF;
        
      END $$;
    `
    
    console.log('✅ Schema migration completed successfully!')
    
    // Test that the columns exist now
    const testQuery = await prisma.user.findMany({
      select: {
        id: true,
        approvalStatus: true,
        approvedBy: true,
        approvalDate: true,
        rejectionReason: true
      },
      take: 1
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database schema migrated successfully',
      testResult: 'Approval columns are now accessible',
      sampleData: testQuery
    })
    
  } catch (error) {
    console.error('Schema migration failed:', error)
    return NextResponse.json(
      { 
        error: 'Schema migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}