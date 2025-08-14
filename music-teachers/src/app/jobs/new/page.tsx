'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewJob() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'PRIVATE_LESSON',
    instruments: [] as string[],
    startDate: '',
    endDate: '',
    payRate: '',
    location: ''
  })
  const [instrumentInput, setInstrumentInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/jobs/new')
      return
    }
    
    if (session.user.role !== 'EMPLOYER') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const jobTypes = [
    { value: 'PRIVATE_LESSON', label: 'Private Lessons' },
    { value: 'GROUP_LESSON', label: 'Group Lessons' },
    { value: 'SCHOOL_POSITION', label: 'School Position' },
    { value: 'SUBSTITUTE', label: 'Substitute Teaching' },
    { value: 'ENSEMBLE', label: 'Ensemble/Orchestra' },
    { value: 'OTHER', label: 'Other' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleAddInstrument = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && instrumentInput.trim()) {
      e.preventDefault()
      const instrument = instrumentInput.trim()
      if (!formData.instruments.includes(instrument)) {
        setFormData(prev => ({
          ...prev,
          instruments: [...prev.instruments, instrument]
        }))
      }
      setInstrumentInput('')
    }
  }

  const handleRemoveInstrument = (instrument: string) => {
    setFormData(prev => ({
      ...prev,
      instruments: prev.instruments.filter(i => i !== instrument)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Job title is required')
      setLoading(false)
      return
    }
    if (!formData.description.trim()) {
      setError('Job description is required')
      setLoading(false)
      return
    }
    if (!formData.startDate) {
      setError('Start date is required')
      setLoading(false)
      return
    }
    if (!formData.payRate || parseFloat(formData.payRate) <= 0) {
      setError('Valid pay rate is required')
      setLoading(false)
      return
    }
    if (!formData.location.trim()) {
      setError('Location is required')
      setLoading(false)
      return
    }
    if (formData.instruments.length === 0) {
      setError('At least one instrument is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          payRate: parseFloat(formData.payRate)
        })
      })

      if (response.ok) {
        setSuccess(true)
        // Reset form
        setFormData({
          title: '',
          description: '',
          jobType: 'PRIVATE_LESSON',
          instruments: [],
          startDate: '',
          endDate: '',
          payRate: '',
          location: ''
        })
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create job posting')
      }
    } catch (error) {
      console.error('Error creating job:', error)
      setError('Failed to create job posting')
    } finally {
      setLoading(false)
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600 mb-4">Your job posting is now live and visible to teachers.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-gray-600">Find the perfect music teacher for your needs</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Piano Teacher for Beginner Students"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the position, requirements, expectations..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="payRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Rate (per hour) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="payRate"
                    name="payRate"
                    value={formData.payRate}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="25.00"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instruments * (Press Enter to add)
              </label>
              <input
                type="text"
                value={instrumentInput}
                onChange={(e) => setInstrumentInput(e.target.value)}
                onKeyDown={handleAddInstrument}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type instrument name and press Enter"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.instruments.map((instrument, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {instrument}
                    <button
                      type="button"
                      onClick={() => handleRemoveInstrument(instrument)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., New York, NY or Remote"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}