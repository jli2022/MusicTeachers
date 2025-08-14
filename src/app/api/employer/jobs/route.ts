import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const employer = await prisma.employer.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!employer) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      )
    }

    const jobs = await prisma.job.findMany({
      where: {
        employerId: employer.id
      },
      include: {
        applications: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching employer jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { jobId, action, ...updateData } = await request.json()

    const employer = await prisma.employer.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!employer) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to this employer
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        employerId: employer.id
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or not authorized' },
        { status: 404 }
      )
    }

    let updatedJob;

    if (action === 'toggle-status') {
      // Toggle job active status
      updatedJob = await prisma.job.update({
        where: {
          id: jobId
        },
        data: {
          isActive: !job.isActive
        }
      })
    } else {
      // Update job details
      updatedJob = await prisma.job.update({
        where: {
          id: jobId
        },
        data: {
          ...updateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
          payRate: updateData.payRate ? parseFloat(updateData.payRate) : undefined
        }
      })
    }

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}