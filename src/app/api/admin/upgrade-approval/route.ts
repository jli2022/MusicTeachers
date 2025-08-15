import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔧 Starting approval system upgrade...')
    
    // Check if approval system is already set up
    let approvalSystemExists = false
    try {
      await prisma.user.findFirst({
        select: { approvalStatus: true }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      approvalSystemExists = true
      console.log('✅ Approval system already exists')
    } catch {
      console.log('ℹ️  Approval system not detected - proceeding with upgrade')
    }

    if (approvalSystemExists) {
      return NextResponse.json({
        success: true,
        message: 'Approval system already exists',
        action: 'no_changes_needed'
      })
    }

    // Run the SQL migration to add approval fields
    console.log('📋 Adding approval system fields...')
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        -- Add ApprovalStatus enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApprovalStatus') THEN
          CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        END IF;
        
        -- Add approvalStatus column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'approvalStatus') THEN
          ALTER TABLE "User" ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED';
        END IF;
        
        -- Add approvedBy column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'approvedBy') THEN
          ALTER TABLE "User" ADD COLUMN "approvedBy" TEXT;
        END IF;
        
        -- Add approvalDate column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'approvalDate') THEN
          ALTER TABLE "User" ADD COLUMN "approvalDate" TIMESTAMP(3);
        END IF;
        
        -- Add rejectionReason column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'rejectionReason') THEN
          ALTER TABLE "User" ADD COLUMN "rejectionReason" TEXT;
        END IF;
      END $$;
    `

    console.log('✅ Database schema updated successfully')

    // Update existing users to be approved
    const usersUpdated = await prisma.$executeRaw`
      UPDATE "User" 
      SET "approvalDate" = NOW(), "approvalStatus" = 'APPROVED'::"ApprovalStatus"
      WHERE "approvalDate" IS NULL
    `

    console.log(`✅ Updated ${usersUpdated} users to APPROVED status`)

    // Get final counts
    const totalUsers = await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: 'Approval system upgrade completed successfully',
      action: 'upgraded',
      stats: {
        totalUsers,
        usersUpdated: Number(usersUpdated)
      },
      nextSteps: [
        'Approval system is now active',
        'All existing users have been set to APPROVED status',
        'New registrations will be PENDING by default',
        'Access admin panel at /admin to manage approvals'
      ]
    })

  } catch (error) {
    console.error('Approval system upgrade failed:', error)
    return NextResponse.json(
      { 
        error: 'Approval system upgrade failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}