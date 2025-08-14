'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GoogleOAuthDemo() {
  const [showMessage, setShowMessage] = useState(false)

  const handleDemoGoogleSignIn = () => {
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 5000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Google OAuth Demo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page demonstrates what the Google OAuth button looks like
          </p>
        </div>

        {/* Demo Google Sign In for Teachers */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Teachers - Sign in with Google</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleDemoGoogleSignIn}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google (Demo)
            </button>
          </div>

          {showMessage && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Demo Mode Active
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This is how the Google OAuth button would appear when properly configured. 
                      To enable real Google authentication, follow the setup guide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            To Enable Google OAuth:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Follow the steps in <code className="bg-gray-200 px-2 py-1 rounded">SETUP-GOOGLE-OAUTH.md</code></li>
            <li>Create Google Cloud Console project</li>
            <li>Configure OAuth consent screen</li>
            <li>Get Client ID and Secret</li>
            <li>Add credentials to <code className="bg-gray-200 px-2 py-1 rounded">.env</code> file</li>
            <li>Restart the application</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            href="/auth/signin" 
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}