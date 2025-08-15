/**
 * Environment-specific configuration
 */

export const config = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature flags
  features: {
    // Enable demo users creation (only in development/staging)
    enableDemoUsers: process.env.ENABLE_DEMO_USERS === 'true' || process.env.NODE_ENV === 'development',
    
    // Enable debugging endpoints (only in development)
    enableDebugEndpoints: process.env.NODE_ENV === 'development',
    
    // Enable database initialization endpoint (only when needed)
    enableDatabaseInit: process.env.ENABLE_DATABASE_INIT === 'true' || process.env.NODE_ENV === 'development',
    
    // Enable migration endpoints (only in development/staging)
    enableMigrationEndpoints: process.env.ENABLE_MIGRATION_ENDPOINTS === 'true' || process.env.NODE_ENV !== 'production'
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    // In production, use connection pooling and stricter settings
    connectionSettings: process.env.NODE_ENV === 'production' ? {
      pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000
      }
    } : undefined
  },
  
  // Admin user configuration (for seeding)
  adminUser: {
    email: process.env.ADMIN_EMAIL || 'admin@musicteachers.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Admin User'
  },
  
  // Application settings
  app: {
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    maxFileSize: process.env.MAX_FILE_SIZE || '10MB'
  }
} as const

export type Config = typeof config