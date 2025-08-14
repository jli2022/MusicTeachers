# Working with Children Check (WWC) Implementation Guide

## 📋 Overview

This document outlines the comprehensive Working with Children Check validation system implemented for the Music Teachers Platform. The current implementation provides robust format validation and expiry checking, with a clear path for future integration with government verification services.

## 🎯 Current Implementation Status

### ✅ **Phase 1: Validation & Testing (COMPLETED)**
- **Format Validation**: All 8 Australian states/territories supported
- **Expiry Validation**: Smart date checking with status indicators  
- **Real-time UI**: Interactive validation with immediate feedback
- **Server-side Security**: API validation prevents invalid data storage
- **Comprehensive Testing**: Official test data from Everproof API docs

### 🚧 **Phase 2: Real Verification (PLANNED)**
- **Government API Integration**: Direct verification with state databases
- **Third-party Services**: Everproof API integration option
- **Fraud Detection**: Real-time status checking
- **Compliance Reporting**: Audit trails and verification logs

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│                 │    │                  │    │                 │
│ • WWCInput      │───▶│ • Format Valid   │───▶│ • WWC Storage   │
│ • Real-time     │    │ • Expiry Check   │    │ • Status Track  │
│ • Visual Status │    │ • Server Valid   │    │ • Audit Logs    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Future: Gov APIs │
                       │ • Everproof      │
                       │ • State DBs      │
                       │ • Real Verify    │
                       └──────────────────┘
```

## 🇦🇺 **Supported Australian States**

| State | Format | Example | Pattern |
|-------|--------|---------|---------|
| **Victoria (VIC)** | WWC-XXXXXXX-XX | `WWC-1234567-12` | `/^WWC-\d{7}-\d{2}$/i` |
| **New South Wales (NSW)** | WWCXXXXXXXE | `WWC1234567E` | `/^WWC\d{7}E$/i` |
| **Queensland (QLD)** | BLUE/YELLOW-XXXXX-XXXX-X | `BLUE-12345-2025-1` | `/^(BLUE\|YELLOW)-\d{5}-\d{4}-\d$/i` |
| **South Australia (SA)** | SAXXXXXXXX | `SA12345678` | `/^SA\d{8}$/i` |
| **Western Australia (WA)** | XXXXXXX/XX | `1234567/25` | `/^\d{7}\/\d{2}$/` |
| **Tasmania (TAS)** | REGXXXXXXXX | `REG12345678` | `/^REG\d{8}$/i` |
| **Northern Territory (NT)** | XXXXXXX | `1234567` | `/^\d{7}$/` |
| **ACT** | REG-XXXXXXXX-X | `REG-12345678-1` | `/^REG-\d{8}-\d$/i` |

## 📁 **File Structure**

```
src/
├── lib/
│   ├── wwc-validation.ts      # Core validation logic
│   └── wwc-test-data.ts       # Test data and scenarios
├── components/
│   └── WWCInput.tsx           # React validation component
├── app/
│   ├── api/profile/route.ts   # Server-side validation
│   ├── profile/page.tsx       # Teacher profile with WWC
│   └── test-wwc/page.tsx      # Testing interface
└── prisma/
    └── schema.prisma          # Database schema (wwcNumber, wwcExpiry)
```

## 🎨 **UI Components**

### **WWCInput Component**
- **Real-time validation** as user types
- **State auto-detection** from WWC number format
- **Visual status indicators** with colors and icons
- **Format examples** with expandable help
- **Error messages** with specific guidance

### **Status Indicators**
- 🟢 **Active**: Valid WWC with 30+ days remaining
- 🟡 **Expiring Soon**: Valid but expires within 30 days
- 🔴 **Expired**: Past expiry date
- ❌ **Invalid**: Wrong format or missing data

## 🧪 **Testing System**

### **Test Data Sources**
1. **Official Everproof API Examples**: Legitimate test numbers from government service
2. **State-Specific Patterns**: Generated examples following official formats
3. **Edge Cases**: Invalid formats, missing data, expired dates

### **Test Interface**
- **URL**: `/test-wwc`
- **Quick Scenarios**: Pre-configured test cases
- **State Examples**: All 8 Australian states
- **Real-time Results**: Live validation feedback

### **Key Test Cases (Updated for August 2025)**
```typescript
// Active WWC
{ wwcNumber: 'WWC-0123456-78', expiryDate: '2026-03-25' }

// Expiring Soon  
{ wwcNumber: 'REG12345678', expiryDate: '2025-09-15' }

// Recently Expired
{ wwcNumber: 'REG-87654321-2', expiryDate: '2025-08-01' }

// Invalid Format
{ wwcNumber: 'INVALID123', expiryDate: '2026-06-30' }
```

## 🔒 **Security & Validation**

### **Frontend Validation**
- Format checking with regex patterns
- Expiry date validation
- Real-time user feedback
- State detection and examples

### **Backend Validation**
- Server-side format verification
- Database constraints
- API error handling
- Audit logging capabilities

### **Database Schema**
```sql
-- Teacher table includes WWC fields
CREATE TABLE "teachers" (
  "wwcNumber"   TEXT,
  "wwcExpiry"   TIMESTAMP(3),
  -- other fields...
);
```

## 🚀 **Future Integration Roadmap**

### **Phase 2A: Third-Party Integration (Everproof)**

**Benefits:**
- Single API for multiple states
- Established government partnerships
- Professional support and SLA
- Immediate verification results

**Implementation:**
```typescript
// Future Everproof integration
async function verifyWWCWithEverproof(wwcNumber: string, state: string) {
  const response = await fetch('https://hoover.everproof.com/v1/verify', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.EVERPROOF_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document_number: wwcNumber,
      document_type: 'wwcc',
      state: state.toLowerCase(),
      webhook_url: process.env.EVERPROOF_WEBHOOK_URL
    })
  })
  
  return response.json()
}
```

**Cost Estimate:**
- **Per verification**: $2-5 AUD
- **Monthly volume**: Depends on teacher registrations
- **Webhook processing**: Additional infrastructure

### **Phase 2B: Direct Government APIs**

**State-Specific Integrations:**

| State | API Available | Documentation | Integration Complexity |
|-------|---------------|---------------|----------------------|
| Victoria | ✅ Yes | Public docs available | Medium |
| NSW | ✅ Yes | Developer portal | Medium |
| Queensland | ⚠️ Limited | Contact required | High |
| SA | ⚠️ Limited | Contact required | High |
| WA | ⚠️ Limited | Contact required | High |
| Tasmania | ❌ No public API | Manual process | Very High |
| NT | ❌ No public API | Manual process | Very High |
| ACT | ⚠️ Limited | Contact required | High |

**Challenges:**
- Multiple API integrations required
- Different authentication methods
- Varying response formats
- State-specific compliance requirements

### **Phase 2C: Hybrid Approach (Recommended)**

**Strategy:**
1. **Primary**: Everproof API for real-time verification
2. **Fallback**: Manual verification process
3. **Audit**: Government direct APIs for compliance checking
4. **Monitoring**: Automated expiry alerts and renewals

## 📊 **Implementation Metrics**

### **Current Validation Coverage**
- ✅ **Format Validation**: 100% (8/8 states)
- ✅ **Expiry Checking**: 100% automated
- ✅ **User Experience**: Real-time feedback
- ✅ **Server Security**: API validation
- ❌ **Government Verification**: 0% (Phase 2)

### **Performance Targets (Phase 2)**
- **Verification Speed**: < 5 seconds
- **Accuracy**: 99.9% (government source)
- **Uptime**: 99.5% (SLA dependent)
- **Cost**: < $5 per verification

## 🔧 **Configuration**

### **Environment Variables (Future)**
```bash
# Everproof API Configuration
EVERPROOF_API_KEY=your_api_key_here
EVERPROOF_WEBHOOK_URL=https://your-app.com/api/webhooks/everproof
EVERPROOF_ENVIRONMENT=sandbox # or production

# Government API Keys (if direct integration)
VIC_WWCC_API_KEY=your_vic_api_key
NSW_WWCC_API_KEY=your_nsw_api_key

# Feature Flags
ENABLE_REAL_WWC_VERIFICATION=false # Currently false
ENABLE_WWC_AUTO_RENEWAL_ALERTS=true
WWC_EXPIRY_WARNING_DAYS=30
```

### **Current Settings**
```typescript
// Current validation settings
export const WWC_CONFIG = {
  VALIDATION_ENABLED: true,
  REAL_VERIFICATION: false, // Phase 2
  EXPIRY_WARNING_DAYS: 30,
  REQUIRE_WWC_FOR_JOBS: true,
  AUTO_SUSPEND_EXPIRED: true
}
```

## 📋 **Compliance & Legal**

### **Current Compliance**
- ✅ **Format Standards**: All Australian state formats
- ✅ **Data Privacy**: No real WWC numbers stored in test data
- ✅ **User Consent**: Clear validation messaging
- ✅ **Audit Trail**: Database logging of changes

### **Phase 2 Compliance Requirements**
- **Privacy Act 1988**: Handling of personal information
- **Children Protection Acts**: State-specific requirements
- **Data Retention**: Government-mandated storage periods
- **Breach Notification**: Immediate reporting requirements

## 🎓 **Usage Examples**

### **Teacher Profile Update**
```typescript
// Teacher updates their WWC information
const wwcData = {
  wwcNumber: 'WWC-1234567-89',
  wwcExpiry: '2026-12-31'
}

// Frontend validation
const validation = validateWWC(wwcData.wwcNumber, wwcData.wwcExpiry)
if (!validation.isValid) {
  // Show errors to user
  showErrors(validation.errors)
  return
}

// Backend API call with validation
const response = await fetch('/api/profile', {
  method: 'PUT',
  body: JSON.stringify(wwcData)
})
```

### **Admin User Creation**
```typescript
// Admin creates a teacher account with WWC
const teacherData = {
  email: 'teacher@example.com',
  name: 'Jane Smith',
  role: 'TEACHER',
  wwcNumber: 'WWC1234567E',
  wwcExpiry: '2026-06-30'
}

// Server-side validation before creation
const wwcValidation = validateWWC(teacherData.wwcNumber, teacherData.wwcExpiry)
if (!wwcValidation.isValid) {
  return res.status(400).json({
    error: 'Invalid WWC details',
    details: wwcValidation.errors
  })
}
```

## 🛠️ **Maintenance & Monitoring**

### **Current Monitoring**
- Format validation success rates
- User input patterns and errors
- Server-side validation logs
- Database integrity checks

### **Future Monitoring (Phase 2)**
- Government API response times
- Verification success/failure rates
- Cost per verification tracking
- Expiry alert effectiveness

### **Maintenance Tasks**
- **Weekly**: Review validation error logs
- **Monthly**: Update test data dates
- **Quarterly**: Review state format changes
- **Annually**: Compliance audit and updates

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **Format Not Recognized**: Check state-specific patterns
2. **Date Validation Errors**: Ensure correct date format (YYYY-MM-DD)
3. **Server Validation Fails**: Check API validation logic
4. **Test Data Expired**: Update test dates in `wwc-test-data.ts`

### **Debug Tools**
- **Test Interface**: `/test-wwc` for validation testing
- **Browser Console**: Real-time validation feedback
- **Server Logs**: Backend validation results
- **Database Queries**: Direct WWC data inspection

## 🎯 **Success Criteria**

### **Phase 1 (Current) - Complete ✅**
- [x] All 8 Australian states supported
- [x] Real-time validation feedback
- [x] Server-side security validation
- [x] Comprehensive test coverage
- [x] User-friendly error messages
- [x] Documentation and examples

### **Phase 2 (Future) - Planned**
- [ ] Real government verification
- [ ] 99.9% accuracy rate
- [ ] < 5 second response time
- [ ] Cost-effective verification
- [ ] Automated expiry alerts
- [ ] Compliance audit passing

---

## 📚 **Related Documentation**

- **[ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md)**: Environment configuration
- **[GOOGLE-OAUTH-SETUP.md](GOOGLE-OAUTH-SETUP.md)**: Authentication setup
- **[DEPLOYMENT-LOG.md](DEPLOYMENT-LOG.md)**: Deployment journey
- **[Prisma Schema](prisma/schema.prisma)**: Database structure

---

**Last Updated**: August 14, 2025  
**Version**: 1.0.0 (Phase 1 Complete)  
**Next Review**: October 2025 (Phase 2 Planning)