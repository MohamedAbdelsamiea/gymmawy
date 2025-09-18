import { PrismaClient } from '@prisma/client';

// Create a Prisma client with middleware
const prisma = new PrismaClient();

// Middleware to automatically expire subscriptions
prisma.$use(async (params, next) => {
  // Only apply to subscription queries
  if (params.model === 'Subscription') {
    
    // Before any subscription query, update expired subscriptions
    if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
      // Update expired subscriptions in the background
      await prisma.subscription.updateMany({
        where: {
          status: 'ACTIVE',
          endDate: { lt: new Date() }
        },
        data: {
          status: 'EXPIRED'
        }
      });
    }
    
    // For create/update operations, check if the subscription should be expired
    if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
      const data = params.args.data;
      
      // If creating/updating with ACTIVE status but endDate is in the past
      if (data.status === 'ACTIVE' && data.endDate && new Date(data.endDate) < new Date()) {
        data.status = 'EXPIRED';
      }
    }
  }
  
  return next(params);
});

export default prisma;
