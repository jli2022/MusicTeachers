'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  const isTeacher = session.user.role === 'TEACHER'
  const isEmployer = session.user.role === 'EMPLOYER'
  const isAdmin = session.user.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
              Music Teachers Platform
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {session.user.name} ({session.user.role})
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Admin dashboard - manage users and platform' : 
             isTeacher ? 'Manage your applications and profile' : 
             'Manage your job postings and applications'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdmin && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                <p className="text-gray-600 mb-4">Manage teachers and employers</p>
                <Link
                  href="/admin"
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-block text-center"
                >
                  Admin Panel
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
                <p className="text-gray-600 mb-4">View platform statistics</p>
                <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                  View Stats
                </button>
              </div>
            </>
          )}

          {isTeacher && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Jobs</h3>
                <p className="text-gray-600 mb-4">Find new teaching opportunities</p>
                <Link
                  href="/jobs"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 inline-block text-center"
                >
                  Browse Jobs
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h3>
                <p className="text-gray-600 mb-4">Track your job applications</p>
                <Link
                  href="/applications"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block text-center"
                >
                  View Applications
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Profile</h3>
                <p className="text-gray-600 mb-4">Update your teaching profile</p>
                <Link
                  href="/profile"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block text-center"
                >
                  Edit Profile
                </Link>
              </div>
            </>
          )}

          {isEmployer && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post a Job</h3>
                <p className="text-gray-600 mb-4">Create a new job listing</p>
                <Link
                  href="/jobs/new"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 inline-block text-center"
                >
                  Post Job
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Job Posts</h3>
                <p className="text-gray-600 mb-4">Manage your job listings</p>
                <Link
                  href="/jobs/my-jobs"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block text-center"
                >
                  My Jobs
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications</h3>
                <p className="text-gray-600 mb-4">Review applications from teachers</p>
                <Link
                  href="/applications/received"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block text-center"
                >
                  View Applications
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display.</p>
        </div>
      </main>
    </div>
  )
}