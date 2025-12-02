import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user after migration...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('AdminSecure123!', 10);
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@arcyberguard.com',
        phoneNumber: '9999999999', // Dummy phone for admin
        password: hashedPassword,
        name: 'System Administrator',
        role: 'admin',
        isPhoneVerified: true // Admin doesn't need phone verification
      }
    });
    
    console.log('✅ Admin user created successfully:');
    console.log(`   Username: admin`);
    console.log(`   Email: admin@arcyberguard.com`);
    console.log(`   Password: AdminSecure123!`);
    console.log(`   Phone: 9999999999`);
    console.log(`   ID: ${admin.id}`);
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
