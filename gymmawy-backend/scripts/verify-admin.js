import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdmin() {
  console.log('🔍 Verifying admin user...');

  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        mobileNumber: true,
        country: true,
        city: true,
        loyaltyPoints: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`🔐 Role: ${adminUser.role}`);
      console.log(`📱 Mobile: ${adminUser.mobileNumber}`);
      console.log(`🌍 Location: ${adminUser.city}, ${adminUser.country}`);
      console.log(`⭐ Loyalty Points: ${adminUser.loyaltyPoints}`);
      console.log(`📅 Created: ${adminUser.createdAt}`);
      console.log(`🔑 Last Login: ${adminUser.lastLoginAt}`);
    } else {
      console.log('❌ No admin user found');
    }

  } catch (error) {
    console.error('❌ Error verifying admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
