'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
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
  employer: {
    user: {
      name: string
    }
    organization?: string
  }
}

export default function Jobs() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId: string) => {
    if (!session) {
      alert('Please sign in to apply for jobs')
      return
    }

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
      })

      if (response.ok) {
        alert('Application submitted successfully!')
        fetchJobs() // Refresh jobs to update UI
      } else {
        const data = await response.json()
        if (response.status === 400 && data.error.includes('already applied')) {
          alert('You have already applied for this job. Check your applications page to track its status.')
        } else {
          alert(data.error || 'Failed to submit application')
        }
      }
    } catch (error) {
      alert('Failed to submit application')
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(filter.toLowerCase()) ||
    job.instruments.some(instrument => 
      instrument.toLowerCase().includes(filter.toLowerCase())
    ) ||
    job.location.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading jobs...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
            <p className="text-gray-600">Find music teaching opportunities</p>
          </div>
          {session && (
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by title, instrument, or location..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">
                      {job.employer.organization || job.employer.user.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      ${job.payRate}/hour
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="font-medium text-gray-900">Instruments:</span>
                    <p className="text-gray-600">{job.instruments.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Location:</span>
                    <p className="text-gray-600">{job.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Start Date:</span>
                    <p className="text-gray-600">
                      {new Date(job.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {session && session.user.role === 'TEACHER' && (
                  <button
                    onClick={() => handleApply(job.id)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Apply Now
                  </button>
                )}

                {!session && (
                  <div className="text-center">
                    <Link
                      href="/auth/signin"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Sign in to apply for this job
                    </Link>
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