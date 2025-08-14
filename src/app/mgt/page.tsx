'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ManagementPortal() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session?.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (session?.user.role === 'EMPLOYER') {
        router.push('/dashboard')
      } else if (session?.user.role === 'TEACHER') {
        router.push('/teacher-login')
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Check user role after successful login
      const session = await getSession()
      if (session?.user.role === 'TEACHER') {
        setError('Teachers should use the Teacher Portal. Redirecting...')
        setTimeout(() => router.push('/teacher-login'), 2000)
        setLoading(false)
        return
      }

      if (session?.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (session?.user.role === 'EMPLOYER') {
        router.push('/dashboard')
      } else {
        setError('Access denied. Please contact an administrator.')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred during login')
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Management Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access for employers and administrators
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className={`mb-4 px-4 py-3 rounded ${
                error.includes('Redirecting') 
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            {/* Access Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Access Levels:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-medium text-purple-600">Administrators:</span> Full system access, user management</li>
                <li><span className="font-medium text-blue-600">Employers:</span> Job posting, application management</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Accounts:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <span className="font-medium text-purple-700">Admin Demo:</span>
              <span className="text-purple-600">admin@musicteachers.com</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="font-medium text-blue-700">Employer Demo:</span>
              <span className="text-blue-600">staff@musicteachers.com</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Password for both: admin123</p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Need an employer account?{' '}
            <span className="text-gray-500">Contact an administrator</span>
          </p>
          <p className="text-sm text-gray-600">
            Are you a teacher?{' '}
            <Link href="/teacher-login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Use the Teacher Portal
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link href="/" className="font-medium text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}