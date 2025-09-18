import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateOrderField() {
  try {
    console.log('Starting to populate order field for existing subscription plans...');
    
    // Get all subscription plans
    const allPlans = await prisma.subscriptionPlan.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`Found ${allPlans.length} plans to update`);
    
    // Update each plan with a sequential order number
    for (let i = 0; i < allPlans.length; i++) {
      const plan = allPlans[i];
      const orderNumber = i + 1;
      
      await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: { order: orderNumber }
      });
      
      console.log(`Updated plan "${plan.name?.en || plan.name || 'Unnamed'}" with order ${orderNumber}`);
    }
    
    console.log('Successfully populated order field for all existing plans!');
    
  } catch (error) {
    console.error('Error populating order field:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateOrderField();
