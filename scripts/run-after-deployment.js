// This script should be run AFTER the deployment is successful
// It will setup test users for the approval system

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  console.log('🔧 Creating test users for approval system...');
  
  const prisma = new PrismaClient();
  
  try {
    // Create test pending teacher
    console.log('Creating pending teacher...');
    const pendingPassword = await bcrypt.hash('pending123', 12);
    
    try {
      await prisma.user.create({
        data: {
          email: 'pending.teacher@test.com',
          name: 'Pending Teacher',
          password: pendingPassword,
          role: 'TEACHER',
          isActive: true,
          approvalStatus: 'PENDING',
          teacher: {
            create: {
              instruments: ['Piano', 'Guitar'],
              qualifications: 'Bachelor of Music, Teaching Diploma'
            }
          }
        }
      });
      console.log('✅ Created pending teacher');
    } catch (e) {
      if (e.code === 'P2002') console.log('ℹ️ Pending teacher already exists');
      else throw e;
    }

    // Create test rejected teacher  
    console.log('Creating rejected teacher...');
    const rejectedPassword = await bcrypt.hash('rejected123', 12);
    
    try {
      await prisma.user.create({
        data: {
          email: 'rejected.teacher@test.com',
          name: 'Rejected Teacher', 
          password: rejectedPassword,
          role: 'TEACHER',
          isActive: true,
          approvalStatus: 'REJECTED',
          approvalDate: new Date(),
          rejectionReason: 'Incomplete WWC documentation',
          teacher: {
            create: {
              instruments: ['Violin']
            }
          }
        }
      });
      console.log('✅ Created rejected teacher');
    } catch (e) {
      if (e.code === 'P2002') console.log('ℹ️ Rejected teacher already exists');
      else throw e;
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\nTest Accounts:');
    console.log('• pending.teacher@test.com / pending123 (PENDING approval)'); 
    console.log('• rejected.teacher@test.com / rejected123 (REJECTED)');
    console.log('• admin@musicteachers.com / admin123 (Admin for approvals)');
    
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers().catch(console.error);