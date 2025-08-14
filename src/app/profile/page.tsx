'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WWCInput from '@/components/WWCInput'
// import { validateWWC } from '@/lib/wwc-validation'
import Link from 'next/link'

interface TeacherProfile {
  id: string
  phone?: string
  address?: string
  wwcNumber?: string
  wwcExpiry?: string
  dateOfBirth?: string
  instruments: string[]
  qualifications?: string
  experience?: string
  rating?: number
  totalRatings?: number
  createdAt: string
  user: {
    name: string
    email: string
    image?: string
  }
}

export default function TeacherProfile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    wwcNumber: '',
    wwcExpiry: '',
    dateOfBirth: '',
    instruments: [] as string[],
    qualifications: '',
    experience: ''
  })
  
  const [instrumentInput, setInstrumentInput] = useState('')

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/profile')
      return
    }
    
    if (session.user.role !== 'TEACHER') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && session.user.role === 'TEACHER') {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        
        // Populate form with existing data
        setFormData({
          name: data.user.name || '',
          phone: data.phone || '',
          address: data.address || '',
          wwcNumber: data.wwcNumber || '',
          wwcExpiry: data.wwcExpiry ? data.wwcExpiry.split('T')[0] : '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          instruments: data.instruments || [],
          qualifications: data.qualifications || '',
          experience: data.experience || ''
        })
      } else {
        setError('Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
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
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setSuccess('Profile updated successfully!')
        
        // Update session if name changed
        if (formData.name !== session?.user.name && session) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: formData.name
            }
          })
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
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
        <div className="text-lg">Loading your profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your teaching profile and credentials</p>
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

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., +61 400 123 456"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>

            {/* Working with Children Check */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Working with Children Check</h2>
              
              <WWCInput
                wwcNumber={formData.wwcNumber}
                wwcExpiry={formData.wwcExpiry}
                onWWCNumberChange={(value) => setFormData(prev => ({ ...prev, wwcNumber: value }))}
                onWWCExpiryChange={(value) => setFormData(prev => ({ ...prev, wwcExpiry: value }))}
                showValidation={true}
                required={true}
              />
            </div>

            {/* Teaching Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Teaching Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruments (Press Enter to add)
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
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Bachelor of Music Education, AMEB Grade 8 Piano..."
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Teaching Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe your teaching experience, specialties, and approach..."
                  />
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            {profile && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-600">{profile.user.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Rating:</span>
                    <p className="text-gray-600">
                      {profile.rating && profile.totalRatings && profile.totalRatings > 0
                        ? `${profile.rating.toFixed(1)}/5 (${profile.totalRatings} reviews)`
                        : 'No ratings yet'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Member since:</span>
                    <p className="text-gray-600">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}