'use client'

import { useState } from 'react'

export default function InitDatabase() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    message: string;
    stats: {
      totalUsers: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    demoAccounts?: {
      admin: string;
      employer: string;
      approvedTeacher: string;
      pendingTeacher: string;
      rejectedTeacher: string;
    };
  } | null>(null)
  const [error, setError] = useState('')

  const initializeDatabase = async (createDemo: boolean) => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/admin/init-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ createDemoUsers: createDemo })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Initialization failed')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Database Initialization
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-yellow-800">
                <h3 className="text-sm font-medium">⚠️ Security Notice</h3>
                <p className="mt-1 text-sm">This endpoint runs only ONCE for initial setup, then permanently disables itself for security.</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            Initialize the production database with approval system fields and optionally create demo users for testing the approval workflow.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => initializeDatabase(false)}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Initializing...' : '🔄 Initialize Database Only'}
            </button>

            <button
              onClick={() => initializeDatabase(true)}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Initializing...' : '🧪 Initialize Database + Create Demo Users'}
            </button>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-800">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800">
                <h3 className="text-sm font-medium mb-2">✅ {result.message}</h3>
                
                <div className="text-sm space-y-2">
                  <p><strong>Database Stats:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    <li>Total Users: {result.stats.totalUsers}</li>
                    <li>Pending: {result.stats.pending}</li>
                    <li>Approved: {result.stats.approved}</li>
                    <li>Rejected: {result.stats.rejected}</li>
                  </ul>

                  {result.demoAccounts && (
                    <div className="mt-4">
                      <p><strong>Demo Accounts Created:</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Admin: {result.demoAccounts.admin}</li>
                        <li>Employer: {result.demoAccounts.employer}</li>
                        <li>Approved Teacher: {result.demoAccounts.approvedTeacher}</li>
                        <li>Pending Teacher: {result.demoAccounts.pendingTeacher}</li>
                        <li>Rejected Teacher: {result.demoAccounts.rejectedTeacher}</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm">
                    🎉 You can now test the approval system at{' '}
                    <a href="/admin" className="font-medium text-green-700 hover:text-green-600">
                      /admin
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">What this does:</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Updates existing users to have approval system fields</li>
              <li>Sets existing users to APPROVED status</li>
              <li>Optionally creates test users with different approval states</li>
              <li>Prepares database for approval workflow testing</li>
            </ul>
          </div>

          <div className="mt-4">
            <a 
              href="/admin" 
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              → Go to Admin Panel
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}