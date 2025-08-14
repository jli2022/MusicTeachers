'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Application {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  message?: string
  createdAt: string
  job: {
    id: string
    title: string
    description: string
    jobType: string
    instruments: string[]
    startDate: string
    endDate?: string
    payRate: number
    location: string
    employer: {
      organization?: string
      user: {
        name: string
      }
    }
  }
}

export default function Applications() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/applications')
      return
    }
    
    if (session.user.role !== 'TEACHER') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && session.user.role === 'TEACHER') {
      fetchApplications()
    }
  }, [session])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Under Review'
      case 'ACCEPTED':
        return 'Accepted'
      case 'REJECTED':
        return 'Rejected'
      default:
        return status
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'TEACHER') {
    return null // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your applications...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600">Track your job applications and their status</p>
          </div>
          <div className="space-x-4">
            <Link
              href="/jobs"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Browse Jobs
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Start browsing jobs and submit your first application.</p>
            <Link
              href="/jobs"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{application.job.title}</h2>
                    <p className="text-gray-600">
                      {application.job.employer.organization || application.job.employer.user.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{application.job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Type:</span>
                    <p className="text-gray-600">{application.job.jobType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Instruments:</span>
                    <p className="text-gray-600">{application.job.instruments.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Location:</span>
                    <p className="text-gray-600">{application.job.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Pay Rate:</span>
                    <p className="text-gray-600">${application.job.payRate}/hour</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Start Date:</span>
                    <p className="text-gray-600">
                      {new Date(application.job.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  {application.job.endDate && (
                    <div>
                      <span className="font-medium text-gray-900">End Date:</span>
                      <p className="text-gray-600">
                        {new Date(application.job.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {application.message && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-900">Your Message:</span>
                    <p className="text-gray-700 mt-1">{application.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}