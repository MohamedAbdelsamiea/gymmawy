import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Admin credentials
const ADMIN_EMAIL = 'admin@gymmawy.com';
const ADMIN_PASSWORD = 'Admin123!@#';

async function createAdmin() {
  console.log('🌱 Creating admin user...');

  try {
    // Create Admin User
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {},
      create: {
        email: ADMIN_EMAIL,
        passwordHash: adminPasswordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        mobileNumber: '+201234567890',
        building: 'Admin Building',
        street: 'Admin Street',
        city: 'Cairo',
        country: 'Egypt',
        postcode: '12345',
        loyaltyPoints: 1000,
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date()
      }
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`👤 Role: ${adminUser.role}`);
    console.log(`🆔 ID: ${adminUser.id}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
