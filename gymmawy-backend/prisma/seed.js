import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create admin user
  const adminPassword = await hashPassword('admin123456');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gymmawy.net' },
    update: {},
    create: {
      email: 'admin@gymmawy.net',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      mobileNumber: '+20106520190',
      country: 'Egypt',
      city: 'Mansoura'
    }
  });
  
  console.log('✅ Admin user created:', adminUser.email);
  
  // Create a test coupon
  const testCoupon = await prisma.coupon.upsert({
    where: { code: 'TEST10' },
    update: {},
    create: {
      code: 'TEST10',
      discountPercentage: 10,
      expirationDate: new Date('2025-12-31T23:59:59.000Z'),
      maxRedemptionsPerUser: 100,
      isActive: true
    }
  });
  
  console.log('✅ Test coupon created:', testCoupon.code);
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
