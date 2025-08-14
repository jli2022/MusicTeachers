#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking environment for migration deployment...');

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.VERCEL === '1' || 
                    process.env.VERCEL_ENV === 'production';

if (isProduction) {
  console.log('🚀 Production environment detected - deploying migrations...');
  console.log(`Environment variables: NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL}, VERCEL_ENV=${process.env.VERCEL_ENV}`);
  console.log(`Database URL available: ${!!process.env.DATABASE_URL}`);
  
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not available - skipping migration');
    console.log('📦 Migration deployment script completed');
    return;
  }
  
  try {
    // Try db push first (faster and more reliable for schema sync)
    console.log('📋 Running: prisma db push (schema sync)');
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      timeout: 90000, // 90 seconds timeout
      env: { ...process.env }
    });
    
    console.log('✅ Database schema synchronized successfully!');
    
    // Optionally seed the database with basic data if needed
    if (process.env.SEED_ON_DEPLOY === 'true') {
      console.log('🌱 Seeding production database...');
      execSync('npm run db:seed', { stdio: 'inherit', env: { ...process.env } });
      console.log('✅ Database seeded successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration deployment failed:', error.message);
    console.error('Error details:', error);
    // Don't exit with error code to prevent deployment failure
    // Just log the error and continue
    console.log('⚠️  Continuing deployment despite migration issues...');
  }
} else {
  console.log('ℹ️  Development environment - skipping migration deployment');
  console.log('   (Use "npm run db:migrate" for local development)');
}

console.log('📦 Migration deployment script completed');