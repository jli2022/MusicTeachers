'use client'

import { useState } from 'react'

export default function DebugAuth() {
  const [email, setEmail] = useState('approved.teacher@test.com')
  const [password, setPassword] = useState('approved123')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/auth-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Network error', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Authentication Debug
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <button
              onClick={testAuth}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Authentication'}
            </button>
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Debug Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Test Accounts:</h3>
            <div className="text-sm space-y-1">
              <button 
                onClick={() => { setEmail('approved.teacher@test.com'); setPassword('approved123') }}
                className="block text-blue-600 hover:text-blue-800"
              >
                → Approved Teacher
              </button>
              <button 
                onClick={() => { setEmail('pending.teacher@test.com'); setPassword('pending123') }}
                className="block text-blue-600 hover:text-blue-800"
              >
                → Pending Teacher
              </button>
              <button 
                onClick={() => { setEmail('admin@musicteachers.com'); setPassword('admin123') }}
                className="block text-blue-600 hover:text-blue-800"
              >
                → Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}