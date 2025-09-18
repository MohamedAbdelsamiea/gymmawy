import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Admin credentials
const ADMIN_EMAIL = 'admin@gymmawy.com';
const ADMIN_PASSWORD = 'Admin123!@#';

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create Admin User
    console.log('👤 Creating admin user...');
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

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // 2. Create Regular Users
    console.log('👥 Creating regular users...');
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const userPasswordHash = await bcrypt.hash('User123!@#', 12);
      const user = await prisma.user.create({
        data: {
          email: `user${i}@gymmawy.com`,
          passwordHash: userPasswordHash,
          firstName: `User${i}`,
          lastName: 'Test',
          role: 'MEMBER',
          mobileNumber: `+20123456789${i}`,
          building: `Building ${i}`,
          street: `Street ${i}`,
          city: 'Cairo',
          country: 'Egypt',
          postcode: `1234${i}`,
          loyaltyPoints: Math.floor(Math.random() * 500),
          createdAt: new Date(2024, 0, i + 1),
          lastLoginAt: new Date()
        }
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} regular users`);

    // 3. Create Categories
    console.log('📂 Creating categories...');
    const categories = [];
    const categoryData = [
      { name: { en: 'Supplements', ar: 'المكملات الغذائية' } },
      { name: { en: 'Equipment', ar: 'المعدات' } },
      { name: { en: 'Apparel', ar: 'الملابس' } },
      { name: { en: 'Nutrition', ar: 'التغذية' } },
      { name: { en: 'Accessories', ar: 'الإكسسوارات' } }
    ];

    for (const catData of categoryData) {
      const category = await prisma.category.create({
        data: catData
      });
      categories.push(category);
    }
    console.log(`✅ Created ${categories.length} categories`);

    // 4. Create Products
    console.log('🛍️ Creating products...');
    const products = [];
    const productData = [
      {
        name: { en: 'Whey Protein', ar: 'بروتين مصل اللبن' },
        description: { en: 'High-quality whey protein powder', ar: 'مسحوق بروتين مصل اللبن عالي الجودة' },
        categoryId: categories[0].id,
        discountPercentage: 10
      },
      {
        name: { en: 'Dumbbells Set', ar: 'مجموعة الدمبل' },
        description: { en: 'Adjustable dumbbells 5-25kg', ar: 'دمبل قابل للتعديل 5-25 كيلو' },
        categoryId: categories[1].id,
        discountPercentage: 15
      },
      {
        name: { en: 'Gym Shorts', ar: 'شورت الجيم' },
        description: { en: 'Comfortable gym shorts', ar: 'شورت جيم مريح' },
        categoryId: categories[2].id,
        discountPercentage: 5
      },
      {
        name: { en: 'Protein Bars', ar: 'ألواح البروتين' },
        description: { en: 'Delicious protein bars', ar: 'ألواح بروتين لذيذة' },
        categoryId: categories[3].id,
        discountPercentage: 0
      },
      {
        name: { en: 'Gym Towel', ar: 'منشفة الجيم' },
        description: { en: 'Absorbent gym towel', ar: 'منشفة جيم ماصة' },
        categoryId: categories[4].id,
        discountPercentage: 0
      }
    ];

    for (const prodData of productData) {
      const product = await prisma.product.create({
        data: prodData
      });
      products.push(product);
    }
    console.log(`✅ Created ${products.length} products`);

    // 5. Create Product Variants
    console.log('🎨 Creating product variants...');
    const variants = [];
    const variantData = [
      { productId: products[0].id, color: 'Chocolate', size: '1kg', priceEGP: 500.00, priceSAR: 150.00, stock: 50 },
      { productId: products[0].id, color: 'Vanilla', size: '1kg', priceEGP: 500.00, priceSAR: 150.00, stock: 30 },
      { productId: products[1].id, color: 'Black', size: '5-25kg', priceEGP: 1200.00, priceSAR: 350.00, stock: 20 },
      { productId: products[2].id, color: 'Black', size: 'M', priceEGP: 150.00, priceSAR: 45.00, stock: 100 },
      { productId: products[2].id, color: 'Black', size: 'L', priceEGP: 150.00, priceSAR: 45.00, stock: 80 },
      { productId: products[3].id, color: 'Mixed', size: '12-pack', priceEGP: 80.00, priceSAR: 25.00, stock: 200 },
      { productId: products[4].id, color: 'Blue', size: 'One Size', priceEGP: 60.00, priceSAR: 18.00, stock: 150 }
    ];

    for (const varData of variantData) {
      const variant = await prisma.productVariant.create({
        data: varData
      });
      variants.push(variant);
    }
    console.log(`✅ Created ${variants.length} product variants`);

    // 6. Create Product Images
    console.log('🖼️ Creating product images...');
    const imageData = [
      { productId: products[0].id, url: 'https://example.com/whey-protein-1.jpg', altText: 'Whey Protein Chocolate', isPrimary: true, order: 1 },
      { productId: products[0].id, url: 'https://example.com/whey-protein-2.jpg', altText: 'Whey Protein Vanilla', isPrimary: false, order: 2 },
      { productId: products[1].id, url: 'https://example.com/dumbbells-1.jpg', altText: 'Dumbbells Set', isPrimary: true, order: 1 },
      { productId: products[1].id, url: 'https://example.com/dumbbells-2.jpg', altText: 'Dumbbells Set Side View', isPrimary: false, order: 2 },
      { productId: products[2].id, url: 'https://example.com/gym-shorts-1.jpg', altText: 'Gym Shorts Black', isPrimary: true, order: 1 },
      { productId: products[3].id, url: 'https://example.com/protein-bars-1.jpg', altText: 'Protein Bars', isPrimary: true, order: 1 },
      { productId: products[4].id, url: 'https://example.com/gym-towel-1.jpg', altText: 'Gym Towel Blue', isPrimary: true, order: 1 }
    ];

    for (const imgData of imageData) {
      await prisma.productImage.create({
        data: imgData
      });
    }
    console.log(`✅ Created ${imageData.length} product images`);

    // 7. Create Subscription Plans
    console.log('📋 Creating subscription plans...');
    const subscriptionPlans = [];
    const planData = [
      {
        name: { en: 'Basic Plan', ar: 'الخطة الأساسية' },
        description: { en: 'Basic gym membership', ar: 'عضوية الجيم الأساسية' },
        priceEGP: 200.00,
        priceSAR: 60.00,
        subscriptionPeriodDays: 30,
        discountPercentage: 0,
        loyaltyPointsAwarded: 20,
        loyaltyPointsRequired: 0
      },
      {
        name: { en: 'Premium Plan', ar: 'الخطة المميزة' },
        description: { en: 'Premium gym membership with personal trainer', ar: 'عضوية الجيم المميزة مع مدرب شخصي' },
        priceEGP: 500.00,
        priceSAR: 150.00,
        subscriptionPeriodDays: 30,
        discountPercentage: 10,
        loyaltyPointsAwarded: 50,
        loyaltyPointsRequired: 0
      },
      {
        name: { en: 'VIP Plan', ar: 'الخطة VIP' },
        description: { en: 'VIP membership with all benefits', ar: 'عضوية VIP مع جميع المميزات' },
        priceEGP: 1000.00,
        priceSAR: 300.00,
        subscriptionPeriodDays: 30,
        discountPercentage: 20,
        loyaltyPointsAwarded: 100,
        loyaltyPointsRequired: 0
      }
    ];

    for (const planDataItem of planData) {
      const plan = await prisma.subscriptionPlan.create({
        data: planDataItem
      });
      subscriptionPlans.push(plan);
    }
    console.log(`✅ Created ${subscriptionPlans.length} subscription plans`);

    // 8. Create Programmes
    console.log('🏋️ Creating programmes...');
    const programmes = [];
    const programmeData = [
      {
        name: { en: 'Weight Loss Program', ar: 'برنامج فقدان الوزن' },
        description: { en: 'Complete weight loss program with diet and exercise', ar: 'برنامج فقدان الوزن الكامل مع النظام الغذائي والتمارين' },
        priceEGP: 300.00,
        priceSAR: 90.00,
        discountPercentage: 15,
        loyaltyPointsAwarded: 30,
        loyaltyPointsRequired: 0,
        imageUrl: 'https://example.com/weight-loss.jpg'
      },
      {
        name: { en: 'Muscle Building Program', ar: 'برنامج بناء العضلات' },
        description: { en: 'Intensive muscle building program', ar: 'برنامج بناء العضلات المكثف' },
        priceEGP: 400.00,
        priceSAR: 120.00,
        discountPercentage: 10,
        loyaltyPointsAwarded: 40,
        loyaltyPointsRequired: 0,
        imageUrl: 'https://example.com/muscle-building.jpg'
      },
      {
        name: { en: 'Cardio Fitness Program', ar: 'برنامج اللياقة القلبية' },
        description: { en: 'Cardio and endurance training program', ar: 'برنامج التدريب القلبي والتحمل' },
        priceEGP: 250.00,
        priceSAR: 75.00,
        discountPercentage: 5,
        loyaltyPointsAwarded: 25,
        loyaltyPointsRequired: 0,
        imageUrl: 'https://example.com/cardio.jpg'
      }
    ];

    for (const progData of programmeData) {
      const programme = await prisma.programme.create({
        data: progData
      });
      programmes.push(programme);
    }
    console.log(`✅ Created ${programmes.length} programmes`);

    // 9. Create Coupons
    console.log('🎫 Creating coupons...');
    const coupons = [];
    const couponData = [
      {
        code: 'WELCOME10',
        discountPercentage: 10,
        expirationDate: new Date('2024-12-31'),
        isActive: true,
        maxRedemptionsPerUser: 1,
        totalRedemptions: 0
      },
      {
        code: 'SUMMER20',
        discountPercentage: 20,
        expirationDate: new Date('2024-12-31'),
        isActive: true,
        maxRedemptionsPerUser: 2,
        totalRedemptions: 0
      },
      {
        code: 'VIP50',
        discountPercentage: 50,
        expirationDate: new Date('2024-12-31'),
        isActive: true,
        maxRedemptionsPerUser: 1,
        totalRedemptions: 0
      }
    ];

    for (const coupData of couponData) {
      const coupon = await prisma.coupon.create({
        data: coupData
      });
      coupons.push(coupon);
    }
    console.log(`✅ Created ${coupons.length} coupons`);

    // 10. Create Orders
    console.log('📦 Creating orders...');
    const orders = [];
    for (let i = 0; i < 3; i++) {
      const order = await prisma.order.create({
        data: {
          userId: users[i].id,
          orderNumber: `ORD${Date.now()}${i}`,
          status: i === 0 ? 'PENDING' : i === 1 ? 'PAID' : 'SHIPPED',
          currency: 'EGP',
          shippingBuilding: `Building ${i + 1}`,
          shippingStreet: `Street ${i + 1}`,
          shippingCity: 'Cairo',
          shippingCountry: 'Egypt',
          shippingPostcode: `1234${i}`,
          couponId: i === 1 ? coupons[0].id : null,
          createdAt: new Date(2024, 0, i + 5)
        }
      });
      orders.push(order);
    }
    console.log(`✅ Created ${orders.length} orders`);

    // 11. Create Order Items
    console.log('📋 Creating order items...');
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const variant = variants[i % variants.length];
      
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productVariantId: variant.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: variant.priceEGP,
          loyaltyPointsAwarded: 10,
          loyaltyPointsRedeemed: 0,
          discountPercentage: 0
        }
      });
    }
    console.log(`✅ Created order items`);

    // 12. Create Payments
    console.log('💳 Creating payments...');
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const paymentMethods = ['CARD', 'CASH', 'INSTAPAY'];
      
      await prisma.payment.create({
        data: {
          user: { connect: { id: order.userId } },
          paymentableId: order.id,
          paymentableType: 'Order',
          amount: 100 + (i * 50),
          currency: 'EGP',
          status: order.status === 'PENDING' ? 'PENDING' : 'SUCCESS',
          method: paymentMethods[i],
          paymentReference: `PAY${Date.now()}${i}`,
          createdAt: new Date(2024, 0, i + 5)
        }
      });
    }
    console.log(`✅ Created payments`);

    // 13. Create Subscriptions
    console.log('📅 Creating subscriptions...');
    for (let i = 0; i < 2; i++) {
      const subscription = await prisma.subscription.create({
        data: {
          userId: users[i].id,
          subscriptionPlanId: subscriptionPlans[i].id,
          subscriptionNumber: `SUB${Date.now()}${i}`,
          status: i === 0 ? 'ACTIVE' : 'PENDING',
          currency: 'EGP',
          price: subscriptionPlans[i].priceEGP,
          paymentMethod: 'CARD',
          discountPercentage: i * 5,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(2024, 0, i + 10)
        }
      });
    }
    console.log(`✅ Created subscriptions`);

    // 14. Create Programme Purchases
    console.log('🏋️ Creating programme purchases...');
    for (let i = 0; i < 2; i++) {
      const purchase = await prisma.programmePurchase.create({
        data: {
          userId: users[i].id,
          programmeId: programmes[i].id,
          purchaseNumber: `PROG${Date.now()}${i}`,
          price: programmes[i].priceEGP,
          currency: 'EGP',
          discountPercentage: programmes[i].discountPercentage,
          status: i === 0 ? 'COMPLETE' : 'PENDING',
          purchasedAt: new Date(2024, 0, i + 15)
        }
      });
    }
    console.log(`✅ Created programme purchases`);

    // 15. Create Leads
    console.log('📞 Creating leads...');
    const leadData = [
      {
        name: 'Ahmed Mohamed',
        email: 'ahmed@example.com',
        mobileNumber: '+201234567890',
        message: 'Interested in gym membership',
        status: 'NEW'
      },
      {
        name: 'Sara Ali',
        email: 'sara@example.com',
        mobileNumber: '+201234567891',
        message: 'Want to know about personal training',
        status: 'CONTACTED'
      },
      {
        name: 'Omar Hassan',
        email: 'omar@example.com',
        mobileNumber: '+201234567892',
        message: 'Inquiry about nutrition programs',
        status: 'NEW'
      }
    ];

    for (const leadDataItem of leadData) {
      await prisma.lead.create({
        data: leadDataItem
      });
    }
    console.log(`✅ Created ${leadData.length} leads`);

    // 16. Create Referral Codes
    console.log('🔗 Creating referral codes...');
    for (let i = 0; i < 3; i++) {
      await prisma.referral.create({
        data: {
          code: `REF${Date.now()}${i}`,
          userId: users[i].id,
          isActive: true,
          expiresAt: new Date('2024-12-31'),
          maxUses: 100,
          currentUses: 0,
          totalRewards: 0
        }
      });
    }
    console.log(`✅ Created referral codes`);

    // 17. Create Transformations
    console.log('🔄 Creating transformations...');
    const transformationData = [
      {
        title: { en: 'Weight Loss Success', ar: 'نجاح فقدان الوزن' },
        imageUrl: 'https://example.com/transformation1.jpg'
      },
      {
        title: { en: 'Muscle Gain Journey', ar: 'رحلة اكتساب العضلات' },
        imageUrl: 'https://example.com/transformation2.jpg'
      }
    ];

    for (const transData of transformationData) {
      await prisma.transformation.create({
        data: transData
      });
    }
    console.log(`✅ Created ${transformationData.length} transformations`);

    // 18. Create Videos
    console.log('🎥 Creating videos...');
    const videoData = [
      {
        title: { en: 'Beginner Workout', ar: 'تمرين للمبتدئين' },
        videoUrl: 'https://example.com/beginner-workout.mp4',
        thumbnailAr: 'https://example.com/beginner-thumb.jpg',
        thumbnailEn: 'https://example.com/beginner-thumb-en.jpg'
      },
      {
        title: { en: 'Advanced Training', ar: 'التدريب المتقدم' },
        videoUrl: 'https://example.com/advanced-training.mp4',
        thumbnailAr: 'https://example.com/advanced-thumb.jpg',
        thumbnailEn: 'https://example.com/advanced-thumb-en.jpg'
      }
    ];

    for (const vidData of videoData) {
      await prisma.video.create({
        data: vidData
      });
    }
    console.log(`✅ Created ${videoData.length} videos`);

    // 19. Create Loyalty Transactions
    console.log('⭐ Creating loyalty transactions...');
    for (let i = 0; i < users.length; i++) {
      await prisma.loyaltyTransaction.create({
        data: {
          userId: users[i].id,
          points: 50 + (i * 10),
          reason: 'Welcome bonus',
          metadata: { source: 'registration' }
        }
      });
    }
    console.log(`✅ Created loyalty transactions`);

    // 20. Create Audit Logs
    console.log('📝 Creating audit logs...');
    for (let i = 0; i < users.length; i++) {
      await prisma.auditLog.create({
        data: {
          userId: users[i].id,
          ipAddress: '192.168.1.1',
          actionType: 'LOGIN',
          createdAt: new Date(2024, 0, i + 1)
        }
      });
    }
    console.log(`✅ Created audit logs`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log('\n👥 Test User Credentials:');
    console.log('📧 Email: user1@gymmawy.com');
    console.log('🔑 Password: User123!@#');
    console.log('\n📊 Summary:');
    console.log(`- 1 Admin user`);
    console.log(`- ${users.length} Regular users`);
    console.log(`- ${categories.length} Categories`);
    console.log(`- ${products.length} Products`);
    console.log(`- ${variants.length} Product variants`);
    console.log(`- ${imageData.length} Product images`);
    console.log(`- ${subscriptionPlans.length} Subscription plans`);
    console.log(`- ${programmes.length} Programmes`);
    console.log(`- ${coupons.length} Coupons`);
    console.log(`- ${orders.length} Orders`);
    console.log(`- ${leadData.length} Leads`);
    console.log(`- ${transformationData.length} Transformations`);
    console.log(`- ${videoData.length} Videos`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
