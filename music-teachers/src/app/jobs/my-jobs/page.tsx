'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  description: string
  jobType: string
  instruments: string[]
  startDate: string
  endDate?: string
  payRate: number
  location: string
  isActive: boolean
  createdAt: string
  applications: Application[]
  _count: {
    applications: number
  }
}

interface Application {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  message?: string
  createdAt: string
  teacher: {
    user: {
      name: string
      email: string
    }
  }
}

export default function MyJobs() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/jobs/my-jobs')
      return
    }
    
    if (session.user.role !== 'EMPLOYER') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && session.user.role === 'EMPLOYER') {
      fetchJobs()
    }
  }, [session])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/employer/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      } else {
        console.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleJobStatus = async (jobId: string) => {
    try {
      const response = await fetch('/api/employer/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId,
          action: 'toggle-status'
        })
      })

      if (response.ok) {
        // Refresh jobs list
        fetchJobs()
      } else {
        console.error('Failed to update job status')
      }
    } catch (error) {
      console.error('Error updating job status:', error)
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
        <div className="text-lg">Loading your job posts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Job Posts</h1>
            <p className="text-gray-600">Manage your job listings and view applications</p>
          </div>
          <div className="space-x-4">
            <Link
              href="/jobs/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Post New Job
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.294a6.965 6.965 0 00-7.5.013" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job posts yet</h3>
            <p className="text-gray-500 mb-4">Create your first job posting to start finding qualified teachers.</p>
            <Link
              href="/jobs/new"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          job.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{job.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleJobStatus(job.id)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        job.isActive
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {job.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Type:</span>
                    <p className="text-gray-600">{job.jobType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Instruments:</span>
                    <p className="text-gray-600">{job.instruments.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Location:</span>
                    <p className="text-gray-600">{job.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Pay Rate:</span>
                    <p className="text-gray-600">${job.payRate}/hour</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Start Date:</span>
                    <p className="text-gray-600">
                      {new Date(job.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  {job.endDate && (
                    <div>
                      <span className="font-medium text-gray-900">End Date:</span>
                      <p className="text-gray-600">
                        {new Date(job.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900">Posted:</span>
                    <p className="text-gray-600">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Applications Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Applications ({job._count.applications})
                    </h3>
                    {job._count.applications > 0 && (
                      <Link
                        href="/applications/received"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View All Applications →
                      </Link>
                    )}
                  </div>

                  {job.applications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No applications yet</p>
                  ) : (
                    <div className="space-y-2">
                      {job.applications.slice(0, 3).map((application) => (
                        <div key={application.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium text-gray-900">
                              {application.teacher.user.name}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                              Applied {new Date(application.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                      ))}
                      {job.applications.length > 3 && (
                        <p className="text-sm text-gray-500 text-center pt-2">
                          +{job.applications.length - 3} more applications
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}