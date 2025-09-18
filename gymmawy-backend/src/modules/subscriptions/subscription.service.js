import { getPrismaClient } from "../../config/db.js";
import { generateSubscriptionNumber, generateUniqueId } from "../../utils/idGenerator.js";
import * as notificationService from "../notifications/notification.service.js";
import * as couponService from "../coupons/coupon.service.js";

const prisma = getPrismaClient();

// Payment validation function
// Handles different payment method requirements:
// - CARD/TABBY/TAMARA: require transactionId (online payment gateway response)
// - INSTA_PAY/VODAFONE_CASH: require paymentProofUrl (manual payment proof)
function validatePaymentData(paymentMethod, transactionId, paymentProofUrl) {
  const errors = [];
  
  // Online payment methods (CARD, TABBY, TAMARA) require transaction ID from payment gateway
  if (['CARD', 'TABBY', 'TAMARA'].includes(paymentMethod)) {
    if (!transactionId || transactionId.trim() === '') {
      errors.push(`Transaction ID is required for online payment method: ${paymentMethod}`);
    }
  }
  
  // Manual payment methods (INSTA_PAY, VODAFONE_CASH) require payment proof URL
  if (['INSTA_PAY', 'VODAFONE_CASH'].includes(paymentMethod)) {
    if (!paymentProofUrl || paymentProofUrl.trim() === '') {
      errors.push(`Payment proof URL is required for manual payment method: ${paymentMethod}`);
    }
  }
  
  // Validate that we have a recognized payment method
  const validMethods = ['CARD', 'TABBY', 'TAMARA', 'INSTA_PAY', 'VODAFONE_CASH'];
  if (!validMethods.includes(paymentMethod)) {
    errors.push(`Invalid payment method: ${paymentMethod}. Must be one of: ${validMethods.join(', ')}`);
  }
  
  if (errors.length > 0) {
    const error = new Error(`Payment validation failed: ${errors.join(', ')}`);
    error.status = 400;
    error.expose = true;
    throw error;
  }
}

export async function listPlans(req) {
  const currency = req?.currency || 'USD'; // Use detected currency or default to USD
  
  const plans = await prisma.subscriptionPlan.findMany({ 
    where: {
      isActive: true,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      discountPercentage: true,
      subscriptionPeriodDays: true,
      giftPeriodDays: true,
      loyaltyPointsAwarded: true,
      loyaltyPointsRequired: true,
      medicalLoyaltyPointsAwarded: true,
      medicalLoyaltyPointsRequired: true,
      crown: true,
      crownColor: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      benefits: {
        where: {
          benefit: {
            deletedAt: null
          }
        },
        include: {
          benefit: true
        }
      },
      // Note: Prices are now handled through the polymorphic Price model
      // We'll fetch prices separately for better performance
    }
  });

  // Fetch prices for all plans in the detected currency
  const planIds = plans.map(plan => plan.id);
  const [subscriptionPrices, medicalPrices] = await Promise.all([
    prisma.subscriptionPlanPrice.findMany({
      where: {
        type: 'NORMAL',
        subscriptionPlanId: { in: planIds },
        currency: currency
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        subscriptionPlanId: true
      }
    }),
    prisma.subscriptionPlanPrice.findMany({
      where: {
        type: 'MEDICAL',
        subscriptionPlanId: { in: planIds },
        currency: currency
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        subscriptionPlanId: true
      }
    })
  ]);

  // Create maps of planId to price for easy lookup
  const subscriptionPriceMap = new Map();
  subscriptionPrices.forEach(price => {
    subscriptionPriceMap.set(price.subscriptionPlanId, price);
  });
  
  const medicalPriceMap = new Map();
  medicalPrices.forEach(price => {
    medicalPriceMap.set(price.subscriptionPlanId, price);
  });

  // Add prices to plans and sort
  const plansWithPrices = plans.map(plan => ({
    ...plan,
    price: subscriptionPriceMap.get(plan.id) || null,
    medicalPrice: medicalPriceMap.get(plan.id) || null
  }));

  // Sort by order field (ascending)
  return plansWithPrices.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function subscribeToPlan(userId, planId) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) { const e = new Error("Invalid plan"); e.status = 400; e.expose = true; throw e; }
  
  // Generate unique subscription number
  const subscriptionNumber = await generateUniqueId(
    generateSubscriptionNumber,
    async (number) => {
      const existing = await prisma.subscription.findUnique({ where: { subscriptionNumber: number } });
      return !existing;
    }
  );
  
  const start = new Date();
  const end = new Date(start.getTime() + (plan.subscriptionPeriodDays + plan.giftPeriodDays) * 24 * 60 * 60 * 1000);
  return prisma.subscription.create({ 
    data: { 
      subscriptionNumber,
      userId, 
      subscriptionPlanId: planId, 
      startDate: start, 
      endDate: end, 
      status: "ACTIVE" 
    } 
  });
}

export async function createSubscriptionWithPayment(userId, subscriptionData) {
  const {
    planId,
    paymentMethod,
    paymentProof,
    transactionId,
    isMedical,
    currency,
    subscriptionPeriodDays,
    giftPeriodDays,
    planName,
    planDescription,
    couponId
  } = subscriptionData;

  // Get plan with prices from database
  const plan = await prisma.subscriptionPlan.findUnique({ 
    where: { id: planId },
    include: {
      prices: true
    }
  });
  
  if (!plan) { 
    const e = new Error("Invalid plan"); 
    e.status = 400; 
    e.expose = true; 
    throw e; 
  }

  // Get plan price for the requested currency and type
  const priceType = isMedical ? 'MEDICAL' : 'NORMAL';
  const planPrice = plan.prices.find(p => p.currency === currency && p.type === priceType);
  if (!planPrice) {
    throw new Error(`Price not available for currency: ${currency} and type: ${priceType}`);
  }

  // Calculate server-side price with plan discount
  const originalPrice = parseFloat(planPrice.amount);
  const planDiscountPercentage = plan.discountPercentage || 0;
  const planDiscountAmount = (originalPrice * planDiscountPercentage) / 100;
  let finalPrice = originalPrice - planDiscountAmount;

  // Calculate coupon discount if coupon is provided
  let couponDiscountAmount = 0;
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) {
      const e = new Error("Invalid coupon"); 
      e.status = 400; 
      e.expose = true; 
      throw e; 
    }

    // Validate coupon redemption limits
    try {
      await couponService.validateCoupon(coupon.code, userId);
    } catch (error) {
      const e = new Error(error.message);
      e.status = error.status || 400;
      e.expose = true;
      throw e;
    }

    // Calculate coupon discount
    if (coupon.discountType === 'PERCENTAGE' || coupon.discountPercentage) {
      // If discountType is PERCENTAGE or if only discountPercentage exists (legacy support)
      couponDiscountAmount = (finalPrice * coupon.discountPercentage) / 100;
    } else if (coupon.discountType === 'FIXED') {
      couponDiscountAmount = Math.min(coupon.discountAmount, finalPrice);
    }
    finalPrice = Math.max(0, finalPrice - couponDiscountAmount);
  }

  console.log('Subscription purchase - server calculated price:', {
    planId,
    originalPrice: originalPrice,
    planDiscount: planDiscountAmount,
    couponDiscount: couponDiscountAmount,
    finalPrice: finalPrice,
    currency: currency,
    isMedical: isMedical
  });


  // Generate unique subscription number
  const subscriptionNumber = await generateUniqueId(
    generateSubscriptionNumber,
    async (number) => {
      const existing = await prisma.subscription.findUnique({ where: { subscriptionNumber: number } });
      return !existing;
    }
  );

  // Calculate subscription dates using plan data
  const start = new Date();
  const totalDays = (subscriptionPeriodDays || plan.subscriptionPeriodDays) + (giftPeriodDays || plan.giftPeriodDays);
  const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);

  // Create subscription with server-calculated price
  const subscription = await prisma.subscription.create({
    data: {
      subscriptionNumber,
      userId,
      subscriptionPlanId: planId,
      startDate: null, // Will be set when approved by admin
      endDate: null, // Will be set when approved by admin
      status: "PENDING", // Start as pending until payment is verified
      isMedical: isMedical || false,
      price: new Decimal(finalPrice), // Use server-calculated price
      currency: currency || 'EGP',
      paymentMethod: paymentMethod || null,
      discountPercentage: planDiscountPercentage, // Use server-calculated plan discount
      couponId: couponId || null,
      couponDiscount: couponDiscountAmount // Use server-calculated coupon discount
    }
  });

  // Log created subscription data for verification
  console.log('Subscription created with coupon data:', {
    subscriptionId: subscription.id,
    subscriptionNumber: subscription.subscriptionNumber,
    couponId: subscription.couponId,
    couponDiscount: subscription.couponDiscount,
    discountPercentage: subscription.discountPercentage,
    price: subscription.price
  });

  // Redeem coupon if couponId is provided
  if (couponId) {
    try {
      const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      await couponService.redeemCoupon(userId, coupon.code);
      console.log('Coupon redeemed successfully for subscription:', subscription.id);
    } catch (error) {
      console.error('Failed to redeem coupon:', error);
      // Don't throw error here as subscription is already created
      // The coupon validation was already done before subscription creation
    }
  }

  // Create payment record if payment method is provided
  if (paymentMethod) {
    // Validate payment data based on payment method
    validatePaymentData(paymentMethod, transactionId, paymentProof);
    
    // Generate unique payment reference
    const paymentReference = await generateUniqueId(
      () => `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      async (ref) => {
        const existing = await prisma.payment.findUnique({ where: { paymentReference: ref } });
        return !existing;
      }
    );

    // Determine payment status based on method
    let paymentStatus = 'PENDING';
    if (paymentMethod === 'INSTA_PAY' || paymentMethod === 'VODAFONE_CASH') {
      // Manual payments start as PENDING, will become PENDING_VERIFICATION when proof is uploaded
      paymentStatus = 'PENDING';
    } else if (paymentMethod === 'CARD' || paymentMethod === 'TABBY' || paymentMethod === 'TAMARA') {
      // Online payments can be processed immediately
      paymentStatus = 'PENDING';
    }

    await prisma.payment.create({
      data: {
        user: { connect: { id: userId } },
        amount: new Decimal(finalPrice), // Use server-calculated price
        currency: currency || 'EGP',
        method: paymentMethod,
        status: paymentStatus,
        paymentReference,
        transactionId: transactionId, // Add transaction ID
        paymentProofUrl: paymentProof, // Store proof URL
        paymentableId: subscription.id,
        paymentableType: 'SUBSCRIPTION',
        metadata: {
          subscriptionNumber: subscription.subscriptionNumber,
          planName: planName,
          isMedical: isMedical,
          discount: planDiscountAmount + couponDiscountAmount,
          originalPrice: originalPrice
        }
      }
    });
  }

  // Create notification for subscription creation
  try {
    await notificationService.notifySubscriptionCreated(subscription);
  } catch (error) {
    console.error('Failed to create subscription notification:', error);
    // Don't fail the subscription creation if notification fails
  }

  return subscription;
}

export async function listUserSubscriptions(userId) {
  // First, update any expired subscriptions using Prisma
  const now = new Date();
  await prisma.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: {
        lt: now
      }
    },
    data: {
      status: 'EXPIRED'
    }
  });
  
  return prisma.subscription.findMany({ 
    where: { userId }, 
    include: { 
      subscriptionPlan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function cancelSubscription(userId, id) {
  const sub = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!sub) return null;
  if (sub.status !== "ACTIVE") return sub;
  return prisma.subscription.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
}

export async function approveSubscription(id) {
  const subscription = await prisma.subscription.findUnique({ 
    where: { id },
    include: {
      subscriptionPlan: true
    }
  });
  
  if (!subscription) {
    const e = new Error("Subscription not found");
    e.status = 404;
    e.expose = true;
    throw e;
  }

  if (subscription.status !== "PENDING") {
    const e = new Error("Subscription is not pending approval");
    e.status = 400;
    e.expose = true;
    throw e;
  }

  // Calculate start and end dates when approved using plan data
  const startDate = new Date();
  const totalDays = subscription.subscriptionPlan.subscriptionPeriodDays + subscription.subscriptionPlan.giftPeriodDays;
  const endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

  const updatedSubscription = await prisma.subscription.update({
    where: { id },
    data: {
      status: "ACTIVE",
      startDate,
      endDate
    }
  });

  // Award loyalty points for subscription completion
  if (subscription.subscriptionPlan.loyaltyPointsAwarded > 0) {
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        loyaltyPoints: {
          increment: subscription.subscriptionPlan.loyaltyPointsAwarded
        }
      }
    });

    await prisma.loyaltyTransaction.create({
      data: {
        userId: subscription.userId,
        points: subscription.subscriptionPlan.loyaltyPointsAwarded,
        type: 'EARNED',
        source: 'SUBSCRIPTION',
        sourceId: subscription.id
      }
    });

    console.log(`Awarded ${subscription.subscriptionPlan.loyaltyPointsAwarded} loyalty points for subscription ${subscription.id}`);
  }

  // Create notification for subscription approval
  try {
    await notificationService.notifySubscriptionApproved(updatedSubscription);
  } catch (error) {
    console.error('Failed to create subscription approval notification:', error);
    // Don't fail the approval if notification fails
  }

  return updatedSubscription;
}

export async function rejectSubscription(id, reason = null) {
  const subscription = await prisma.subscription.findUnique({ where: { id } });
  if (!subscription) {
    const e = new Error("Subscription not found");
    e.status = 404;
    e.expose = true;
    throw e;
  }

  if (subscription.status !== "PENDING") {
    const e = new Error("Subscription is not pending approval");
    e.status = 400;
    e.expose = true;
    throw e;
  }

  return prisma.subscription.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectionReason: reason
    }
  });
}

export async function getPendingSubscriptions() {
  return prisma.subscription.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      subscriptionPlan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function expireSubscriptions() {
  const now = new Date();
  
  // Find all ACTIVE subscriptions that have passed their end date
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now }
    },
    select: { id: true, userId: true, subscriptionNumber: true }
  });

  if (expiredSubscriptions.length === 0) {
    return { expiredCount: 0, message: "No subscriptions to expire" };
  }

  // Update all expired subscriptions to EXPIRED status
  const result = await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now }
    },
    data: {
      status: "EXPIRED"
    }
  });

  return {
    expiredCount: result.count,
    message: `Successfully expired ${result.count} subscription(s)`,
    expiredSubscriptions: expiredSubscriptions.map(sub => ({
      id: sub.id,
      subscriptionNumber: sub.subscriptionNumber
    }))
  };
}

