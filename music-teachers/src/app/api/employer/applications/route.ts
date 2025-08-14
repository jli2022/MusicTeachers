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

    // Get all applications for jobs posted by this employer
    const applications = await prisma.application.findMany({
      where: {
        job: {
          employerId: employer.id
        }
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            jobType: true,
            payRate: true,
            location: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching employer applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
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

    const { applicationId, status } = await request.json()

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED or REJECTED' },
        { status: 400 }
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

    // Verify the application belongs to one of this employer's jobs
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          employerId: employer.id
        }
      },
      include: {
        job: {
          select: {
            title: true
          }
        },
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
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or not authorized' },
        { status: 404 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId
      },
      data: {
        status
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            jobType: true,
            payRate: true,
            location: true,
            startDate: true,
            endDate: true
          }
        }
      }
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}