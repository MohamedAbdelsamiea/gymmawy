import { PrismaClient } from '@prisma/client';

// Create the base Prisma client
const prisma = new PrismaClient();

// Extend Prisma with subscription-specific methods
const extendedPrisma = prisma.$extends({
  name: 'subscription-extension',
  
  // Add computed fields
  result: {
    subscription: {
      isExpired: {
        needs: { status: true, endDate: true },
        compute(subscription) {
          return subscription.status === 'ACTIVE' && 
                 subscription.endDate && 
                 new Date(subscription.endDate) < new Date();
        }
      },
      computedStatus: {
        needs: { status: true, endDate: true },
        compute(subscription) {
          if (subscription.status === 'ACTIVE' && 
              subscription.endDate && 
              new Date(subscription.endDate) < new Date()) {
            return 'EXPIRED';
          }
          return subscription.status;
        }
      }
    }
  },
  
  // Add custom methods
  model: {
    subscription: {
      // Method to get subscriptions with computed status
      async findManyWithComputedStatus(args = {}) {
        // First, update any expired subscriptions
        await this.updateMany({
          where: {
            status: 'ACTIVE',
            endDate: { lt: new Date() }
          },
          data: {
            status: 'EXPIRED'
          }
        });
        
        // Then return the subscriptions
        return this.findMany(args);
      },
      
      // Method to get only active (non-expired) subscriptions
      async findActive(args = {}) {
        await this.updateMany({
          where: {
            status: 'ACTIVE',
            endDate: { lt: new Date() }
          },
          data: {
            status: 'EXPIRED'
          }
        });
        
        return this.findMany({
          ...args,
          where: {
            ...args.where,
            status: 'ACTIVE',
            endDate: { gte: new Date() }
          }
        });
      },
      
      // Method to expire subscriptions
      async expireExpired() {
        const result = await this.updateMany({
          where: {
            status: 'ACTIVE',
            endDate: { lt: new Date() }
          },
          data: {
            status: 'EXPIRED'
          }
        });
        
        return {
          expiredCount: result.count,
          message: `Successfully expired ${result.count} subscription(s)`
        };
      }
    }
  }
});

export default extendedPrisma;
