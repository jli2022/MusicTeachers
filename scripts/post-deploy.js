#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Running post-deployment setup...');

// Check if we're in a deployment environment
const isDeployment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

if (isDeployment && process.env.DATABASE_URL) {
  try {
    console.log('📋 Running database migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      timeout: 60000 // 60 seconds timeout
    });
    
    console.log('🌱 Running database seed...');
    execSync('npm run db:seed', { 
      stdio: 'inherit',
      timeout: 60000 // 60 seconds timeout
    });
    
    console.log('✅ Post-deployment setup completed successfully!');
  } catch (error) {
    console.error('❌ Post-deployment setup failed:', error.message);
    // Don't exit with error code to prevent deployment failure
    console.log('⚠️  Continuing deployment despite setup issues...');
  }
} else {
  console.log('ℹ️  Skipping post-deployment setup (not in deployment environment)');
}

console.log('📦 Post-deployment script completed');