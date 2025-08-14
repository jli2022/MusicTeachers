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
  teacher: {
    id: string
    instruments: string[]
    qualifications?: string
    experience?: string
    user: {
      name: string
      email: string
      image?: string
    }
  }
  job: {
    id: string
    title: string
    jobType: string
    payRate: number
    location: string
    startDate: string
    endDate?: string
  }
}

export default function ReceivedApplications() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/applications/received')
      return
    }
    
    if (session.user.role !== 'EMPLOYER') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && session.user.role === 'EMPLOYER') {
      fetchApplications()
    }
  }, [session])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/employer/applications')
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

  const updateApplicationStatus = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setProcessingId(applicationId)
    try {
      const response = await fetch('/api/employer/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId,
          status
        })
      })

      if (response.ok) {
        // Update the local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status }
              : app
          )
        )
      } else {
        console.error('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
    } finally {
      setProcessingId(null)
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

  const filteredApplications = applications.filter(app => 
    filter === 'ALL' || app.status === filter
  )

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(app => app.status === 'PENDING').length,
    ACCEPTED: applications.filter(app => app.status === 'ACCEPTED').length,
    REJECTED: applications.filter(app => app.status === 'REJECTED').length
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'EMPLOYER') {
    return null // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Received Applications</h1>
            <p className="text-gray-600">Review and manage applications from teachers</p>
          </div>
          <div className="space-x-4">
            <Link
              href="/jobs/my-jobs"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              My Jobs
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'ALL' ? 'No applications yet' : `No ${filter.toLowerCase()} applications`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'ALL' 
                ? 'When teachers apply for your jobs, their applications will appear here.'
                : `No applications with ${filter.toLowerCase()} status.`
              }
            </p>
            {filter === 'ALL' && (
              <Link
                href="/jobs/new"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Post a Job
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {application.teacher.user.name}
                      </h2>
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{application.teacher.user.email}</p>
                    <p className="text-sm text-gray-500">
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {application.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                        disabled={processingId === application.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === application.id ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                        disabled={processingId === application.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === application.id ? 'Processing...' : 'Accept'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Job Details */}
                <div className="border-t border-b py-4 mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Job: {application.job.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Type:</span>
                      <p className="text-gray-600">{application.job.jobType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Location:</span>
                      <p className="text-gray-600">{application.job.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Pay Rate:</span>
                      <p className="text-gray-600">${application.job.payRate}/hour</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Start Date:</span>
                      <p className="text-gray-600">
                        {new Date(application.job.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teacher Profile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instruments</h4>
                    <div className="flex flex-wrap gap-1">
                      {application.teacher.instruments.map((instrument, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm"
                        >
                          {instrument}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {application.teacher.qualifications && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                      <p className="text-gray-600 text-sm">{application.teacher.qualifications}</p>
                    </div>
                  )}
                </div>

                {application.teacher.experience && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                    <p className="text-gray-600 text-sm">{application.teacher.experience}</p>
                  </div>
                )}

                {application.message && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-gray-900 mb-2">Application Message</h4>
                    <p className="text-gray-700 text-sm">{application.message}</p>
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