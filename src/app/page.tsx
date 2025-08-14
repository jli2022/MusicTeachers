import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <h1 className="text-2xl font-bold text-gray-900">Music Teachers Platform</h1>
          <div className="space-x-4">
            <Link
              href="/teacher-login"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Teacher Portal
            </Link>
            <Link
              href="/mgt"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Management Portal
            </Link>
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Connect Music Teachers
              <span className="block text-indigo-600">with Opportunities</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Find qualified music teachers for your institution or discover your next teaching opportunity.
            </p>
            {/* Portal Selection */}
            <div className="mt-8 max-w-2xl mx-auto">
              <p className="text-lg text-gray-600 mb-6">Choose your portal:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher Portal */}
                <Link href="/teacher-login" className="group">
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 hover:border-indigo-300 hover:bg-indigo-100 transition-all">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">Teacher Portal</h3>
                    <p className="text-indigo-700 text-sm">Access your profile, find jobs, manage applications</p>
                  </div>
                </Link>

                {/* Management Portal */}
                <Link href="/mgt" className="group">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-100 transition-all">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-lg mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Management Portal</h3>
                    <p className="text-gray-700 text-sm">Employers & Admins: Post jobs, manage users</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Apply as Teacher
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Teachers</h3>
              <p className="text-gray-600">Find substitute and permanent teaching positions that match your skills and availability.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Schools</h3>
              <p className="text-gray-600">Access a pool of qualified music teachers with verified credentials and WWC checks.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Compliant</h3>
              <p className="text-gray-600">All teachers are verified with current Working With Children checks and qualifications.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
