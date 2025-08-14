'use client'

import { useState } from 'react'

export default function MigrateSchema() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    testResult: string;
    sampleData: unknown;
  } | null>(null)
  const [error, setError] = useState('')

  const runMigration = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/admin/migrate-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Migration failed')
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
            🔧 Database Schema Migration
          </h1>
          
          <p className="text-gray-600 mb-8">
            This will add the approval system columns to the production database if they don&apos;t exist.
            Run this BEFORE initializing the database.
          </p>

          <button
            onClick={runMigration}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Migration...' : '🚀 Run Schema Migration'}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">
                <h3 className="text-sm font-medium">Error</h3>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800">
                <h3 className="text-sm font-medium mb-2">✅ {result.message}</h3>
                <p className="text-sm">{result.testResult}</p>
                
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm">
                    🎉 You can now proceed to{' '}
                    <a href="/init" className="font-medium text-green-700 hover:text-green-600">
                      initialize the database
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">What this does:</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Creates ApprovalStatus enum if it doesn&apos;t exist</li>
              <li>Adds approvalStatus column with PENDING default</li>
              <li>Adds approvedBy, approvalDate, rejectionReason columns</li>
              <li>Safe to run multiple times (checks if columns exist first)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}