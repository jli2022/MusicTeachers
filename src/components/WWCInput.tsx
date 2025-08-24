'use client'

import { useState, useEffect } from 'react'
import { validateWWC, getWWCStatusDisplay, WWC_FORMATS, type WWCValidation } from '@/lib/wwc-validation'
import { QUICK_TEST_SCENARIOS } from '@/lib/wwc-test-data'

interface WWCInputProps {
  wwcNumber: string
  wwcExpiry: string
  onWWCNumberChange: (value: string) => void
  onWWCExpiryChange: (value: string) => void
  showValidation?: boolean
  required?: boolean
}

export default function WWCInput({
  wwcNumber,
  wwcExpiry,
  onWWCNumberChange,
  onWWCExpiryChange,
  showValidation = true,
  required = false
}: WWCInputProps) {
  const [validation, setValidation] = useState<WWCValidation | null>(null)
  const [showFormats, setShowFormats] = useState(false)
  const [touched, setTouched] = useState({ number: false, expiry: false })

  // Real-time validation
  useEffect(() => {
    if ((wwcNumber.trim() || wwcExpiry.trim()) && showValidation) {
      const result = validateWWC(wwcNumber, wwcExpiry)
      setValidation(result)
    } else {
      setValidation(null)
    }
  }, [wwcNumber, wwcExpiry, showValidation])

  const statusDisplay = validation ? getWWCStatusDisplay(validation.status) : null

  const handleNumberBlur = () => {
    setTouched(prev => ({ ...prev, number: true }))
  }

  const handleExpiryBlur = () => {
    setTouched(prev => ({ ...prev, expiry: true }))
  }

  const shouldShowErrors = showValidation && validation && (touched.number || touched.expiry)

  return (
    <div className="space-y-4">
      {/* WWC Number Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="wwcNumber" className="block text-sm font-medium text-gray-700">
            WWC Number {required && <span className="text-red-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setShowFormats(!showFormats)}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
          >
            Show formats
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            id="wwcNumber"
            name="wwcNumber"
            value={wwcNumber}
            onChange={(e) => onWWCNumberChange(e.target.value)}
            onBlur={handleNumberBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              shouldShowErrors && validation?.errors.some(e => e.toLowerCase().includes('number'))
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
            placeholder="Enter WWC number (e.g., WWC-1234567-12)"
          />
          
          {/* State Detection */}
          {validation?.state && (
            <div className="absolute right-3 top-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {validation.state}
              </span>
            </div>
          )}
        </div>

        {/* Format Examples */}
        {showFormats && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Australian WWC Formats:</h4>
            
            {/* Format Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-4">
              {WWC_FORMATS.map((format) => (
                <div key={format.state} className="flex justify-between">
                  <span className="font-medium">{format.state}:</span>
                  <span className="text-gray-600">{format.example}</span>
                </div>
              ))}
            </div>

            {/* Test Data Examples */}
            <div className="border-t pt-3 mt-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Test Data Examples:</h5>
              <div className="space-y-2 text-xs">
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <div className="font-medium text-green-800">✓ Valid Active:</div>
                  <div className="text-green-700">{QUICK_TEST_SCENARIOS.valid_active.wwcNumber}</div>
                  <div className="text-green-600 text-xs">Expiry: {QUICK_TEST_SCENARIOS.valid_active.expiryDate}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="font-medium text-yellow-800">⚠ Expiring Soon:</div>
                  <div className="text-yellow-700">{QUICK_TEST_SCENARIOS.valid_expiring.wwcNumber}</div>
                  <div className="text-yellow-600 text-xs">Expiry: {QUICK_TEST_SCENARIOS.valid_expiring.expiryDate}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="font-medium text-red-800">✗ Recently Expired:</div>
                  <div className="text-red-700">{QUICK_TEST_SCENARIOS.recently_expired.wwcNumber}</div>
                  <div className="text-red-600 text-xs">Expiry: {QUICK_TEST_SCENARIOS.recently_expired.expiryDate}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WWC Expiry Input */}
      <div>
        <label htmlFor="wwcExpiry" className="block text-sm font-medium text-gray-700 mb-2">
          WWC Expiry Date {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="date"
          id="wwcExpiry"
          name="wwcExpiry"
          value={wwcExpiry}
          onChange={(e) => onWWCExpiryChange(e.target.value)}
          onBlur={handleExpiryBlur}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            shouldShowErrors && validation?.errors.some(e => e.toLowerCase().includes('expir'))
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Validation Status */}
      {showValidation && validation && (wwcNumber.trim() || wwcExpiry.trim()) && (
        <div className="space-y-2">
          {/* Status Badge */}
          {statusDisplay && (
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                <span className="mr-1">{statusDisplay.icon}</span>
                {statusDisplay.label}
                {validation.daysUntilExpiry !== undefined && validation.daysUntilExpiry >= 0 && (
                  <span className="ml-2 text-xs">({validation.daysUntilExpiry} days)</span>
                )}
              </span>
            </div>
          )}

          {/* Error Messages */}
          {shouldShowErrors && validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">WWC Validation Issues:</h3>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {validation.isValid && validation.state && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Valid WWC Check</h3>
                  <p className="mt-1 text-sm text-green-700">
                    {validation.state} format recognized. 
                    {validation.daysUntilExpiry && validation.daysUntilExpiry > 30 && 
                      ` Expires in ${validation.daysUntilExpiry} days.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}