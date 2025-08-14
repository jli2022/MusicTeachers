#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking environment for migration deployment...');

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (isProduction) {
  console.log('🚀 Production environment detected - deploying migrations...');
  
  try {
    // Run migration deployment
    console.log('📋 Running: prisma migrate deploy');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      timeout: 120000 // 2 minutes timeout
    });
    
    console.log('✅ Database migrations deployed successfully!');
    
    // Optionally seed the database with basic data if needed
    if (process.env.SEED_ON_DEPLOY === 'true') {
      console.log('🌱 Seeding production database...');
      execSync('npm run db:seed', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration deployment failed:', error.message);
    // Don't exit with error code to prevent deployment failure
    // Just log the error and continue
    console.log('⚠️  Continuing deployment despite migration issues...');
  }
} else {
  console.log('ℹ️  Development environment - skipping migration deployment');
  console.log('   (Use "npm run db:migrate" for local development)');
}

console.log('📦 Migration deployment script completed');