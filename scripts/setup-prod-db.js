const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://postgres.mosjvmjbugsypqpafria:MusicTeach3245@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function setupProductionDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

  try {
    console.log('🚀 Setting up production database...');

    // First, update existing users to be APPROVED (in case some are pending)
    console.log('📋 Updating existing users to APPROVED status...');
    const updateResult = await prisma.user.updateMany({
      where: {
        OR: [
          { approvalStatus: null },
          { approvalStatus: 'PENDING' }
        ]
      },
      data: {
        approvalStatus: 'APPROVED',
        approvalDate: new Date()
      }
    });
    console.log(`✅ Updated ${updateResult.count} existing users to APPROVED`);

    // Create test pending teacher
    console.log('👨‍🏫 Creating test pending teacher...');
    const pendingPassword = await bcrypt.hash('pending123', 12);
    
    try {
      const pendingTeacher = await prisma.user.create({
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
      console.log(`✅ Created pending teacher: ${pendingTeacher.email}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('ℹ️  Pending teacher already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Create test rejected teacher
    console.log('👨‍🏫 Creating test rejected teacher...');
    const rejectedPassword = await bcrypt.hash('rejected123', 12);
    
    try {
      const rejectedTeacher = await prisma.user.create({
        data: {
          email: 'rejected.teacher@test.com',
          name: 'Rejected Teacher',
          password: rejectedPassword,
          role: 'TEACHER',
          isActive: true,
          approvalStatus: 'REJECTED',
          approvalDate: new Date(),
          rejectionReason: 'Incomplete WWC documentation and missing qualifications.',
          teacher: {
            create: {
              instruments: ['Violin'],
              qualifications: 'Music Certificate (incomplete)'
            }
          }
        }
      });
      console.log(`✅ Created rejected teacher: ${rejectedTeacher.email}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('ℹ️  Rejected teacher already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Create test approved teacher
    console.log('👨‍🏫 Creating test approved teacher...');
    const approvedPassword = await bcrypt.hash('approved123', 12);
    
    try {
      const approvedTeacher = await prisma.user.create({
        data: {
          email: 'approved.teacher@test.com',
          name: 'Approved Teacher',
          password: approvedPassword,
          role: 'TEACHER',
          isActive: true,
          approvalStatus: 'APPROVED',
          approvalDate: new Date(),
          teacher: {
            create: {
              instruments: ['Piano', 'Voice', 'Flute'],
              qualifications: 'Master of Music Education, AMEB Grade 8',
              wwcNumber: 'WWC-1234567-89',
              wwcExpiry: new Date('2026-12-31')
            }
          }
        }
      });
      console.log(`✅ Created approved teacher: ${approvedTeacher.email}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('ℹ️  Approved teacher already exists, skipping...');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 Production database setup complete!');
    console.log('\n📋 Test Accounts Created:');
    console.log('1. pending.teacher@test.com / pending123 (Status: PENDING)');
    console.log('2. rejected.teacher@test.com / rejected123 (Status: REJECTED)');
    console.log('3. approved.teacher@test.com / approved123 (Status: APPROVED)');
    console.log('\n🔑 Existing Admin Account:');
    console.log('   admin@musicteachers.com / admin123 (Use this to manage approvals)');

  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupProductionDatabase()
  .then(() => {
    console.log('✨ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });