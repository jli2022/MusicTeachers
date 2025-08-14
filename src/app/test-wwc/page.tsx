'use client'

import { useState } from 'react'
import WWCInput from '@/components/WWCInput'
import { validateWWC, WWC_FORMATS } from '@/lib/wwc-validation'
import { ALL_WWC_TEST_DATA, QUICK_TEST_SCENARIOS, type WWCTestCase } from '@/lib/wwc-test-data'

export default function TestWWC() {
  const [wwcNumber, setWwcNumber] = useState('')
  const [wwcExpiry, setWwcExpiry] = useState('')

  const runTest = (testCase: WWCTestCase | { wwcNumber: string; expiryDate: string }) => {
    setWwcNumber(testCase.wwcNumber)
    setWwcExpiry(testCase.expiryDate)
  }

  const runScenarioTest = (scenario: { wwcNumber: string; expiryDate: string }) => {
    setWwcNumber(scenario.wwcNumber)
    setWwcExpiry(scenario.expiryDate)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">WWC Validation Testing</h1>
        
        {/* Official Test Scenarios */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🏛️ Official Test Scenarios</h2>
          <p className="text-sm text-gray-600 mb-4">Test data from Everproof API documentation (official WWC verification service)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(QUICK_TEST_SCENARIOS).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => runScenarioTest(scenario)}
                className={`p-3 text-left rounded border-2 hover:shadow-md transition-all ${
                  key.includes('invalid') || key.includes('expired') || key.includes('missing')
                    ? 'border-red-200 hover:border-red-300 bg-red-50'
                    : key.includes('expiring')
                    ? 'border-yellow-200 hover:border-yellow-300 bg-yellow-50'
                    : 'border-green-200 hover:border-green-300 bg-green-50'
                }`}
              >
                <div className="font-medium text-sm">{scenario.description}</div>
                <div className="text-xs text-gray-600 mt-1">{scenario.wwcNumber}</div>
              </button>
            ))}
          </div>
        </div>

        {/* All State Test Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🇦🇺 Complete State Test Data</h2>
          <p className="text-sm text-gray-600 mb-4">Comprehensive test data for all Australian states and territories</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_WWC_TEST_DATA.map((testCase, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{testCase.stateName} ({testCase.state})</h3>
                    <p className="text-sm text-gray-600">{testCase.personName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    testCase.expectedStatus === 'Active' ? 'bg-green-100 text-green-800' :
                    testCase.expectedStatus === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {testCase.expectedStatus}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <div><strong>WWC:</strong> <code className="bg-gray-100 px-1 rounded">{testCase.wwcNumber}</code></div>
                  <div><strong>Expires:</strong> {testCase.expiryDate}</div>
                  <div><strong>DOB:</strong> {testCase.dateOfBirth}</div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Source: {testCase.source}
                </div>
                <button
                  onClick={() => runTest(testCase)}
                  className="mt-2 w-full px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  Test This Case
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* WWC Input Component */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">WWC Validation Test</h2>
          
          <WWCInput
            wwcNumber={wwcNumber}
            wwcExpiry={wwcExpiry}
            onWWCNumberChange={setWwcNumber}
            onWWCExpiryChange={setWwcExpiry}
            showValidation={true}
            required={true}
          />

          {/* Manual Validation Results */}
          {(wwcNumber || wwcExpiry) && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Validation Results:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(validateWWC(wwcNumber, wwcExpiry), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Supported Formats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Supported WWC Formats</h2>
          <div className="space-y-4">
            {WWC_FORMATS.map((format) => (
              <div key={format.state} className="border-l-4 border-indigo-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{format.stateName} ({format.state})</h3>
                    <p className="text-sm text-gray-600 mb-1">{format.description}</p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{format.example}</code>
                  </div>
                  <button
                    onClick={() => runTest({ 
                      wwcNumber: format.example, 
                      expiryDate: '2025-12-31' 
                    })}
                    className="text-indigo-600 hover:text-indigo-800 text-sm underline"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clear Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setWwcNumber('')
              setWwcExpiry('')
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Form
          </button>
        </div>
      </div>
    </div>
  )
}