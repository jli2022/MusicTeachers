// WWC (Working with Children Check) Validation System
// Supports all Australian states and territories

export interface WWCValidation {
  isValid: boolean
  state?: string
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Invalid' | 'Unknown'
  errors: string[]
  normalizedNumber?: string
  expiryDate?: Date
  daysUntilExpiry?: number
}

export interface WWCFormat {
  state: string
  stateName: string
  pattern: RegExp
  example: string
  description: string
}

// Australian state WWC formats
export const WWC_FORMATS: WWCFormat[] = [
  {
    state: 'VIC',
    stateName: 'Victoria',
    pattern: /^WWC-\d{7}-\d{2}$/i,
    example: 'WWC-1234567-12',
    description: 'Victoria Working with Children Check'
  },
  {
    state: 'NSW',
    stateName: 'New South Wales',
    pattern: /^WWC\d{7}E$/i,
    example: 'WWC1234567E',
    description: 'NSW Working with Children Check'
  },
  {
    state: 'QLD',
    stateName: 'Queensland',
    pattern: /^(BLUE|YELLOW)-\d{5}-\d{4}-\d$/i,
    example: 'BLUE-12345-2024-1',
    description: 'Queensland Blue/Yellow Card'
  },
  {
    state: 'SA',
    stateName: 'South Australia',
    pattern: /^SA\d{8}$/i,
    example: 'SA12345678',
    description: 'South Australia DHS Screening Check'
  },
  {
    state: 'WA',
    stateName: 'Western Australia',
    pattern: /^\d{7}\/\d{2}$/,
    example: '1234567/12',
    description: 'Western Australia Working with Children Card'
  },
  {
    state: 'TAS',
    stateName: 'Tasmania',
    pattern: /^REG\d{8}$/i,
    example: 'REG12345678',
    description: 'Tasmania Registration to Work with Vulnerable People'
  },
  {
    state: 'NT',
    stateName: 'Northern Territory',
    pattern: /^\d{7}$/,
    example: '1234567',
    description: 'Northern Territory Ochre Card'
  },
  {
    state: 'ACT',
    stateName: 'Australian Capital Territory',
    pattern: /^REG-\d{8}-\d$/i,
    example: 'REG-12345678-1',
    description: 'ACT Working with Vulnerable People Registration'
  }
]

/**
 * Validates WWC number format and determines the state
 */
export function validateWWCNumber(wwcNumber: string): {
  isValid: boolean
  state?: string
  stateName?: string
  errors: string[]
  normalizedNumber?: string
} {
  const errors: string[] = []

  if (!wwcNumber || wwcNumber.trim().length === 0) {
    return {
      isValid: false,
      errors: ['WWC number is required']
    }
  }

  const trimmedNumber = wwcNumber.trim().toUpperCase()

  // Check against each state format
  for (const format of WWC_FORMATS) {
    if (format.pattern.test(trimmedNumber)) {
      return {
        isValid: true,
        state: format.state,
        stateName: format.stateName,
        normalizedNumber: trimmedNumber,
        errors: []
      }
    }
  }

  errors.push('WWC number format is not recognized for any Australian state')
  errors.push(`Supported formats: ${WWC_FORMATS.map(f => `${f.state}: ${f.example}`).join(', ')}`)

  return {
    isValid: false,
    errors,
    normalizedNumber: trimmedNumber
  }
}

/**
 * Validates WWC expiry date
 */
export function validateWWCExpiry(expiryDate: string | Date): {
  isValid: boolean
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Invalid'
  errors: string[]
  daysUntilExpiry?: number
  expiryDate?: Date
} {
  const errors: string[] = []

  if (!expiryDate) {
    return {
      isValid: false,
      status: 'Invalid',
      errors: ['WWC expiry date is required']
    }
  }

  let parsedDate: Date
  try {
    parsedDate = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
    
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date')
    }
  } catch {
    return {
      isValid: false,
      status: 'Invalid',
      errors: ['Invalid expiry date format']
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const expiry = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
  
  const timeDiff = expiry.getTime() - today.getTime()
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24))

  let status: 'Active' | 'Expired' | 'Expiring Soon' | 'Invalid'
  
  if (daysUntilExpiry < 0) {
    status = 'Expired'
    errors.push(`WWC expired ${Math.abs(daysUntilExpiry)} days ago`)
  } else if (daysUntilExpiry <= 30) {
    status = 'Expiring Soon'
    if (daysUntilExpiry === 0) {
      errors.push('WWC expires today')
    } else {
      errors.push(`WWC expires in ${daysUntilExpiry} days`)
    }
  } else {
    status = 'Active'
  }

  return {
    isValid: status === 'Active' || status === 'Expiring Soon',
    status,
    errors,
    daysUntilExpiry,
    expiryDate: parsedDate
  }
}

/**
 * Complete WWC validation including number and expiry
 */
export function validateWWC(wwcNumber: string, expiryDate: string | Date): WWCValidation {
  const numberValidation = validateWWCNumber(wwcNumber)
  const expiryValidation = validateWWCExpiry(expiryDate)

  const isValid = numberValidation.isValid && expiryValidation.isValid
  const errors = [...numberValidation.errors, ...expiryValidation.errors]

  return {
    isValid,
    state: numberValidation.state,
    status: expiryValidation.status,
    errors,
    normalizedNumber: numberValidation.normalizedNumber,
    expiryDate: expiryValidation.expiryDate,
    daysUntilExpiry: expiryValidation.daysUntilExpiry
  }
}

/**
 * Get WWC status with color coding for UI
 */
export function getWWCStatusDisplay(status: WWCValidation['status']) {
  switch (status) {
    case 'Active':
      return {
        label: 'Active',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: '✅'
      }
    case 'Expiring Soon':
      return {
        label: 'Expiring Soon',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: '⚠️'
      }
    case 'Expired':
      return {
        label: 'Expired',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: '❌'
      }
    case 'Invalid':
      return {
        label: 'Invalid',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: '❌'
      }
    default:
      return {
        label: 'Unknown',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: '❓'
      }
  }
}

/**
 * Get examples for all states (for help text)
 */
export function getWWCExamples(): string {
  return WWC_FORMATS.map(format => 
    `${format.state}: ${format.example}`
  ).join('\n')
}

/**
 * Get state name from WWC number
 */
export function getStateFromWWC(wwcNumber: string): string | undefined {
  const validation = validateWWCNumber(wwcNumber)
  return validation.stateName
}