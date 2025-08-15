'use client'

import { useState } from 'react'

export default function UpgradeApproval() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    action: string;
    stats?: {
      totalUsers: number;
      usersUpdated: number;
    };
    nextSteps?: string[];
    error?: string;
    details?: string;
  } | null>(null)

  const runUpgrade = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/upgrade-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        action: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔄 Upgrade to Approval System
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-blue-800">
                <h3 className="text-sm font-medium">📋 What this does:</h3>
                <ul className="mt-1 text-sm list-disc list-inside">
                  <li>Adds approval system fields to existing database</li>
                  <li>Sets all existing users to APPROVED status</li>
                  <li>Enables teacher registration approval workflow</li>
                  <li>Safe to run multiple times</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={runUpgrade}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-6"
          >
            {loading ? 'Upgrading...' : '🚀 Upgrade Database to Approval System'}
          </button>

          {result && (
            <div className={`mt-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-md p-4`}>
              <div className={result.success ? 'text-green-800' : 'text-red-800'}>
                <h3 className="text-sm font-medium mb-2">
                  {result.success ? '✅' : '❌'} {result.message}
                </h3>
                
                {result.stats && (
                  <div className="text-sm space-y-1 mb-3">
                    <p><strong>Upgrade Results:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                      <li>Total Users: {result.stats.totalUsers}</li>
                      <li>Users Updated: {result.stats.usersUpdated}</li>
                    </ul>
                  </div>
                )}

                {result.nextSteps && (
                  <div className="text-sm space-y-1 mb-3">
                    <p><strong>Next Steps:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                      {result.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.error && (
                  <div className="text-sm mt-2">
                    <p><strong>Error:</strong> {result.error}</p>
                    {result.details && <p><strong>Details:</strong> {result.details}</p>}
                  </div>
                )}

                {result.success && result.action === 'upgraded' && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm">
                      🎉 You can now manage user approvals at{' '}
                      <a href="/admin" className="font-medium text-green-700 hover:text-green-600">
                        /admin
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <a 
                href="/admin" 
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                → Go to Admin Panel
              </a>
              <a 
                href="/init" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                → Try Full Init (if available)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}