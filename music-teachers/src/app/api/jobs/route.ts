import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        isActive: true
      },
      include: {
        employer: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      title,
      description,
      jobType,
      instruments,
      startDate,
      endDate,
      payRate,
      location
    } = await request.json()

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

    const job = await prisma.job.create({
      data: {
        title,
        description,
        jobType,
        instruments,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        payRate: parseFloat(payRate),
        location,
        employerId: employer.id
      }
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}