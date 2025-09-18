import { getPrismaClient } from "../../config/db.js";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = getPrismaClient();


export async function dashboardStats() {
  const now = new Date();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const [
    totalUsers,
    usersThisWeek,
    totalOrders, 
    ordersThisWeek, 
    activeSubscriptions, 
    activeSubscriptionsThisWeek, 
    programPurchases, 
    programPurchasesThisWeek,
    // All successful payments - EGP
    totalRevenueEGP,
    revenueThisWeekEGP,
    // All successful payments - SAR
    totalRevenueSAR,
    revenueThisWeekSAR,
    // All successful payments - AED
    totalRevenueAED,
    revenueThisWeekAED,
    // All successful payments - USD
    totalRevenueUSD,
    revenueThisWeekUSD,
    // Loyalty points
    totalLoyaltyPointsRewarded,
    loyaltyPointsRewardedThisWeek,
    totalLoyaltyPointsRedeemed,
    loyaltyPointsRedeemedThisWeek
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ 
      where: { 
        status: 'ACTIVE',
        createdAt: { gte: startOfWeek } 
      } 
    }),
    prisma.programmePurchase.count(),
    prisma.programmePurchase.count({ where: { purchasedAt: { gte: startOfWeek } } }),
    
    // All successful payments - EGP
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'EGP'
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'EGP',
        createdAt: { gte: startOfWeek }
      }
    }),
    
    // All successful payments - SAR
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'SAR'
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'SAR',
        createdAt: { gte: startOfWeek }
      }
    }),
    
    // All successful payments - AED
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'AED'
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'AED',
        createdAt: { gte: startOfWeek }
      }
    }),
    
    // All successful payments - USD
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'USD'
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'SUCCESS',
        currency: 'USD',
        createdAt: { gte: startOfWeek }
      }
    }),
    
    // Loyalty points rewarded (from loyalty transactions)
    prisma.loyaltyTransaction.aggregate({
      _sum: { points: true },
      where: { 
        type: 'EARNED',
        points: { gt: 0 }
      }
    }),
    prisma.loyaltyTransaction.aggregate({
      _sum: { points: true },
      where: { 
        type: 'EARNED',
        points: { gt: 0 },
        createdAt: { gte: startOfWeek }
      }
    }),
    
    // Loyalty points redeemed (from loyalty transactions)
    prisma.loyaltyTransaction.aggregate({
      _sum: { points: true },
      where: { 
        type: 'REDEEMED',
        points: { lt: 0 }
      }
    }),
    prisma.loyaltyTransaction.aggregate({
      _sum: { points: true },
      where: { 
        type: 'REDEEMED',
        points: { lt: 0 },
        createdAt: { gte: startOfWeek }
      }
    })
  ]);
  
  // Revenue is directly from successful payments
  const finalTotalRevenueEGP = Number(totalRevenueEGP._sum.amount || 0);
  const finalRevenueThisWeekEGP = Number(revenueThisWeekEGP._sum.amount || 0);
  const finalTotalRevenueSAR = Number(totalRevenueSAR._sum.amount || 0);
  const finalRevenueThisWeekSAR = Number(revenueThisWeekSAR._sum.amount || 0);
  const finalTotalRevenueAED = Number(totalRevenueAED._sum.amount || 0);
  const finalRevenueThisWeekAED = Number(revenueThisWeekAED._sum.amount || 0);
  const finalTotalRevenueUSD = Number(totalRevenueUSD._sum.amount || 0);
  const finalRevenueThisWeekUSD = Number(revenueThisWeekUSD._sum.amount || 0);

  return { 
    users: {
      total: totalUsers,
      week: usersThisWeek
    },
    orders: {
      total: totalOrders,
      week: ordersThisWeek
    },
    revenueEGP: {
      total: finalTotalRevenueEGP,
      week: finalRevenueThisWeekEGP
    },
    revenueSAR: {
      total: finalTotalRevenueSAR,
      week: finalRevenueThisWeekSAR
    },
    revenueAED: {
      total: finalTotalRevenueAED,
      week: finalRevenueThisWeekAED
    },
    revenueUSD: {
      total: finalTotalRevenueUSD,
      week: finalRevenueThisWeekUSD
    },
    activeSubscriptions: {
      total: activeSubscriptions,
      week: activeSubscriptionsThisWeek
    },
    programPurchases: {
      total: programPurchases,
      week: programPurchasesThisWeek
    },
    loyaltyPointsRewarded: {
      total: Number(totalLoyaltyPointsRewarded._sum.points || 0),
      week: Number(loyaltyPointsRewardedThisWeek._sum.points || 0)
    },
    loyaltyPointsRedeemed: {
      total: Math.abs(Number(totalLoyaltyPointsRedeemed._sum.points || 0)),
      week: Math.abs(Number(loyaltyPointsRedeemedThisWeek._sum.points || 0))
    }
  };
}

export async function exportOrders() {
  const orders = await prisma.order.findMany({ include: { items: true, user: true } });
  return orders;
}

export async function exportLeads() {
  const leads = await prisma.lead.findMany();
  return leads;
}

export async function getAnalytics(query = {}) {
  const { period = '30d' } = query;
  
  const now = new Date();
  const startDate = new Date(now.getTime() - (period === '7d' ? 7 : period === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalOrders,
    totalRevenue,
    totalProducts,
    totalSubscriptions,
    revenueByDay,
    ordersByDay
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    prisma.order.count(),
    prisma.payment.aggregate({ 
      _sum: { amount: true }, 
      where: { status: "COMPLETED" } 
    }),
    prisma.product.count(),
    prisma.subscription.count(),
    prisma.payment.groupBy({
      by: ['createdAt'],
      _sum: { amount: true },
      where: { 
        status: "COMPLETED",
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.order.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: { 
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  return {
    overview: {
      totalUsers,
      newUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalProducts,
      totalSubscriptions
    },
    charts: {
      revenueByDay: revenueByDay.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        amount: Number(item._sum.amount || 0)
      })),
      ordersByDay: ordersByDay.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count.id
      }))
    }
  };
}

// User management
export async function getUsers(query = {}) {
  const { page = 1, pageSize = 10, search } = query;
  const skip = (page - 1) * pageSize;
  
  const where = search ? {
    OR: [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ]
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mobileNumber: true,
        birthDate: true,
        role: true,
        loyaltyPoints: true,
        building: true,
        street: true,
        city: true,
        country: true,
        postcode: true,
        createdAt: true,
        lastLoginAt: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return { items: users, total, page, pageSize };
}

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      mobileNumber: true,
      building: true,
      street: true,
      city: true,
      country: true,
      postcode: true,
      createdAt: true,
      lastLoginAt: true
    }
  });
}

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      mobileNumber: data.mobileNumber,
      building: data.building,
      street: data.street,
      city: data.city,
      country: data.country,
      postcode: data.postcode
    }
  });
}

export async function deleteUser(id) {
  return prisma.user.update({
    where: { id },
    data: { 
      deletedAt: new Date(),
      email: `deleted_${Date.now()}_${id}@deleted.com`
    }
  });
}

// Order management
export async function getOrders(query = {}) {
  const { page = 1, pageSize = 10, status } = query;
  const skip = (page - 1) * pageSize;
  
  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { include: { product: true } }
      }
    }),
    prisma.order.count({ where })
  ]);

  return { items: orders, total, page, pageSize };
}

export async function getOrderById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: { include: { product: true } },
      payments: true
    }
  });
}

export async function updateOrder(id, data) {
  return prisma.order.update({
    where: { id },
    data: {
      status: data.status,
      notes: data.notes,
      shippingAddress: data.shippingAddress
    }
  });
}

export async function deleteOrder(id) {
  return prisma.order.delete({ where: { id } });
}

// Product management
export async function getProducts(query = {}) {
  const { page = 1, pageSize = 10, search } = query;
  const skip = (page - 1) * pageSize;
  
  const where = search ? {
    name: { contains: search, mode: 'insensitive' }
  } : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true
      }
    }),
    prisma.product.count({ where })
  ]);

  return { items: products, total, page, pageSize };
}

export async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true
    }
  });
}

export async function updateProduct(id, data) {
  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description
    }
  });
}

export async function deleteProduct(id) {
  return prisma.product.delete({ where: { id } });
}

// Additional service functions for missing endpoints
export async function getSubscriptionStats() {
  // First, update any expired subscriptions
  const now = new Date();
  await prisma.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now }
    },
    data: {
      status: 'EXPIRED'
    }
  });
  
  const [totalSubscriptions, activeSubscriptions, pendingSubscriptions, expiredSubscriptions] = await Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'PENDING' } }),
    prisma.subscription.count({ where: { status: 'EXPIRED' } })
  ]);

  // Calculate monthly revenue
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get revenue for all currencies from payments
  const [monthlyRevenueEGP, monthlyRevenueSAR, monthlyRevenueAED, monthlyRevenueUSD] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'EGP',
        paymentableType: 'SUBSCRIPTION',
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'SAR',
        paymentableType: 'SUBSCRIPTION',
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'AED',
        paymentableType: 'SUBSCRIPTION',
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'USD',
        paymentableType: 'SUBSCRIPTION',
        createdAt: { gte: startOfMonth }
      }
    })
  ]);

  return {
    totalSubscriptions,
    activeSubscriptions,
    pendingSubscriptions,
    expiredSubscriptions,
    monthlyRevenue: {
      EGP: Number(monthlyRevenueEGP._sum.amount || 0),
      SAR: Number(monthlyRevenueSAR._sum.amount || 0),
      AED: Number(monthlyRevenueAED._sum.amount || 0),
      USD: Number(monthlyRevenueUSD._sum.amount || 0)
    }
  };
}

export async function getSubscriptionPlans(query = {}) {
  const { page = 1, pageSize = 10 } = query;
  const skip = (page - 1) * pageSize;
  
  const [allPlans, total] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: {
        deletedAt: null
      },
      include: {
        benefits: {
          where: {
            benefit: {
              deletedAt: null
            }
          },
          include: {
            benefit: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        prices: true,
        _count: {
          select: {
            subscriptions: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    }),
    prisma.subscriptionPlan.count({
      where: {
        deletedAt: null
      }
    })
  ]);

  // Process plans to separate regular and medical prices
  const processedPlans = allPlans.map(plan => {
    const regularPrices = plan.prices.filter(price => price.type === 'NORMAL');
    const medicalPrices = plan.prices.filter(price => price.type === 'MEDICAL');
    
    // Find prices for each currency
    const priceByCurrency = {};
    const medicalPriceByCurrency = {};
    
    regularPrices.forEach(p => {
      priceByCurrency[p.currency] = p.amount;
    });
    
    medicalPrices.forEach(p => {
      medicalPriceByCurrency[p.currency] = p.amount;
    });
    
    // Create price objects in the format frontend expects
    // Default to EGP if available, otherwise use the first available currency
    const availableCurrencies = Object.keys(priceByCurrency);
    const defaultCurrency = availableCurrencies.includes('EGP') ? 'EGP' : availableCurrencies[0];
    
    const availableMedicalCurrencies = Object.keys(medicalPriceByCurrency);
    const defaultMedicalCurrency = availableMedicalCurrencies.includes('EGP') ? 'EGP' : availableMedicalCurrencies[0];
    
    const price = defaultCurrency ? {
      amount: priceByCurrency[defaultCurrency],
      currency: defaultCurrency
    } : null;
    
    const medicalPrice = defaultMedicalCurrency ? {
      amount: medicalPriceByCurrency[defaultMedicalCurrency],
      currency: defaultMedicalCurrency
    } : null;
    
    // Process benefits to use custom descriptions when available
    const processedBenefits = plan.benefits.map(benefitRelation => {
      const benefit = benefitRelation.benefit;
      const customDescription = benefitRelation.customDescription;
      
      return {
        id: benefit.id,
        description: customDescription || benefit.description, // Use custom description if available
        originalDescription: benefit.description, // Keep original for reference
        isCustom: !!customDescription, // Flag to indicate if this is a custom description
        order: benefitRelation.order // Include the order field
      };
    });
    
    return {
      ...plan,
      price,
      medicalPrice,
      // Add all prices for each currency
      allPrices: {
        regular: priceByCurrency,
        medical: medicalPriceByCurrency
      },
      // Keep the original prices array for backward compatibility
      prices: plan.prices,
      // Replace benefits with processed benefits
      benefits: processedBenefits,
      // Add subscription count for frontend
      _aggr_count_subscriptions: plan._count?.subscriptions || 0
    };
  });

  // Sort by order field (ascending)
  const sortedPlans = processedPlans.sort((a, b) => {
    return a.order - b.order;
  });

  // Apply pagination after sorting
  const plans = sortedPlans.slice(skip, skip + pageSize);
  
  return { items: plans, total, page, pageSize };
}

export async function getSubscriptionPlanById(id) {
  const plan = await prisma.subscriptionPlan.findUnique({ 
    where: { id },
    include: {
      benefits: {
        where: {
          benefit: {
            deletedAt: null
          }
        },
        include: {
          benefit: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      prices: true
    }
  });

  if (!plan) return null;

  // Process prices to separate regular and medical prices
  const regularPrices = plan.prices.filter(price => price.type === 'NORMAL');
  const medicalPrices = plan.prices.filter(price => price.type === 'MEDICAL');
  
  // Find prices for each currency
  const priceByCurrency = {};
  const medicalPriceByCurrency = {};
  
  regularPrices.forEach(p => {
    priceByCurrency[p.currency] = p.amount;
  });
  
  medicalPrices.forEach(p => {
    medicalPriceByCurrency[p.currency] = p.amount;
  });
  
  // Create price objects in the format frontend expects
  // Default to EGP if available, otherwise use the first available currency
  const availableCurrencies = Object.keys(priceByCurrency);
  const defaultCurrency = availableCurrencies.includes('EGP') ? 'EGP' : availableCurrencies[0];
  
  const availableMedicalCurrencies = Object.keys(medicalPriceByCurrency);
  const defaultMedicalCurrency = availableMedicalCurrencies.includes('EGP') ? 'EGP' : availableMedicalCurrencies[0];
  
  const price = defaultCurrency ? {
    amount: priceByCurrency[defaultCurrency],
    currency: defaultCurrency
  } : null;
  
  const medicalPrice = defaultMedicalCurrency ? {
    amount: medicalPriceByCurrency[defaultMedicalCurrency],
    currency: defaultMedicalCurrency
  } : null;
  
  // Process benefits to use custom descriptions when available
  const processedBenefits = plan.benefits.map(benefitRelation => {
    const benefit = benefitRelation.benefit;
    const customDescription = benefitRelation.customDescription;
    
    return {
      id: benefit.id,
      description: customDescription || benefit.description, // Use custom description if available
      originalDescription: benefit.description, // Keep original for reference
      isCustom: !!customDescription, // Flag to indicate if this is a custom description
      order: benefitRelation.order // Include the order field
    };
  });

  return {
    ...plan,
    price,
    medicalPrice,
    // Add all prices for each currency
    allPrices: {
      regular: priceByCurrency,
      medical: medicalPriceByCurrency
    },
    // Keep the original prices array for backward compatibility
    prices: plan.prices,
    // Replace benefits with processed benefits
    benefits: processedBenefits
  };
}

export async function createSubscriptionPlan(data) {
  const { benefits, prices, ...planData } = data;
  
  // Remove any fields that shouldn't be passed to Prisma
  const { priceEGP, priceSAR, priceAED, priceUSD, medicalEGP, medicalSAR, medicalAED, medicalUSD, ...cleanPlanData } = planData;
  
  // Get the next order number if not provided
  if (!cleanPlanData.order) {
    const lastPlan = await prisma.subscriptionPlan.findFirst({
      where: { deletedAt: null },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    
    cleanPlanData.order = (lastPlan?.order || 0) + 1;
  }
  
  // Debug logs removed for production
  
  // Create the subscription plan
  const plan = await prisma.subscriptionPlan.create({ 
    data: cleanPlanData
  });
  
  // Handle benefits if provided
  if (benefits && benefits.length > 0) {
    await handlePlanBenefits(plan.id, benefits);
  }
  
  // Handle prices if provided
  if (prices && prices.length > 0) {
    await handlePlanPrices(plan.id, prices);
  }
  
  // Return the plan with benefits and prices
  return prisma.subscriptionPlan.findUnique({ 
    where: { id: plan.id },
    include: {
      benefits: {
        where: {
          benefit: {
            deletedAt: null
          }
        },
        include: {
          benefit: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      prices: {
      }
    }
  });
}

export async function updateSubscriptionPlan(id, data) {
  const { benefits, prices, ...planData } = data;
  
  // Remove any fields that shouldn't be passed to Prisma
  const { priceEGP, priceSAR, priceAED, priceUSD, medicalEGP, medicalSAR, medicalAED, medicalUSD, ...cleanPlanData } = planData;
  
  // No order validation needed - allow any order value for drag and drop
  
  // Debug logs removed for production
  
  // Update the subscription plan
  const plan = await prisma.subscriptionPlan.update({ 
    where: { id }, 
    data: cleanPlanData 
  });
  
  // Handle benefits if provided
  if (benefits !== undefined) {
    // Get current benefits to compare
    const currentBenefits = await prisma.subscriptionPlanBenefit.findMany({
      where: { subscriptionPlanId: id },
      select: { benefitId: true, customDescription: true }
    });
    
    // Normalize current benefits for comparison
    const currentBenefitData = currentBenefits.map(b => ({
      id: b.benefitId,
      description: b.customDescription
    })).sort((a, b) => a.id.localeCompare(b.id));
    
    // Normalize new benefits for comparison
    const newBenefitData = benefits.map(benefit => {
      if (typeof benefit === 'string') {
        return { id: benefit, description: null };
      } else if (benefit.id && benefit.description) {
        return { id: benefit.id, description: benefit.description };
      } else {
        return { id: benefit.id || benefit, description: null };
      }
    }).sort((a, b) => a.id.localeCompare(b.id));
    
    console.log('🔍 Backend - Current benefit data:', currentBenefitData);
    console.log('🔍 Backend - New benefit data:', newBenefitData);
    console.log('🔍 Backend - Benefits changed:', JSON.stringify(currentBenefitData) !== JSON.stringify(newBenefitData));
    
    // Only update if benefits have actually changed
    if (JSON.stringify(currentBenefitData) !== JSON.stringify(newBenefitData)) {
      console.log('🔄 Backend - Updating benefits...');
      // First, remove all existing benefit relationships
      await prisma.subscriptionPlanBenefit.deleteMany({
        where: { subscriptionPlanId: id }
      });
      
      // Then add the new benefit relationships
      if (benefits && benefits.length > 0) {
        await handlePlanBenefits(id, benefits);
      }
    } else {
      console.log('✅ Backend - Benefits unchanged, skipping update');
    }
  }
  
  // Handle prices if provided
  if (prices !== undefined) {
    await handlePlanPrices(id, prices);
  }
  
  // Return the plan with benefits and prices
  return prisma.subscriptionPlan.findUnique({ 
    where: { id },
    include: {
      benefits: {
        where: {
          benefit: {
            deletedAt: null
          }
        },
        include: {
          benefit: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      prices: {
      }
    }
  });
}

export async function deleteSubscriptionPlan(id) {
  return prisma.subscriptionPlan.update({ 
    where: { id }, 
    data: { deletedAt: new Date() } 
  });
}

export async function updateSubscriptionPlanBenefitOrder(planId, benefits) {
  // Update benefit order for a specific subscription plan
  const updates = benefits.map((benefit, index) => 
    prisma.subscriptionPlanBenefit.update({
      where: {
        subscriptionPlanId_benefitId: {
          subscriptionPlanId: planId,
          benefitId: benefit.id
        }
      },
      data: {
        order: index + 1
      }
    })
  );

  await Promise.all(updates);

  // Return updated plan with ordered benefits (use the same processing as getSubscriptionPlanById)
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    include: {
      benefits: {
        where: {
          benefit: {
            deletedAt: null
          }
        },
        include: {
          benefit: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      prices: true
    }
  });

  if (!plan) return null;

  // Process prices to separate regular and medical prices
  const regularPrices = plan.prices.filter(price => price.type === 'NORMAL');
  const medicalPrices = plan.prices.filter(price => price.type === 'MEDICAL');
  
  // Find prices for each currency
  const priceByCurrency = {};
  const medicalPriceByCurrency = {};
  
  regularPrices.forEach(p => {
    priceByCurrency[p.currency] = p.amount;
  });
  
  medicalPrices.forEach(p => {
    medicalPriceByCurrency[p.currency] = p.amount;
  });
  
  // Create price objects in the format frontend expects
  // Default to EGP if available, otherwise use the first available currency
  const availableCurrencies = Object.keys(priceByCurrency);
  const defaultCurrency = availableCurrencies.includes('EGP') ? 'EGP' : availableCurrencies[0];
  
  const availableMedicalCurrencies = Object.keys(medicalPriceByCurrency);
  const defaultMedicalCurrency = availableMedicalCurrencies.includes('EGP') ? 'EGP' : availableMedicalCurrencies[0];
  
  const price = defaultCurrency ? {
    amount: priceByCurrency[defaultCurrency],
    currency: defaultCurrency
  } : null;
  
  const medicalPrice = defaultMedicalCurrency ? {
    amount: medicalPriceByCurrency[defaultMedicalCurrency],
    currency: defaultMedicalCurrency
  } : null;
  
  // Process benefits to use custom descriptions when available
  const processedBenefits = plan.benefits.map(benefitRelation => {
    const benefit = benefitRelation.benefit;
    const customDescription = benefitRelation.customDescription;
    
    return {
      id: benefit.id,
      description: customDescription || benefit.description, // Use custom description if available
      originalDescription: benefit.description, // Keep original for reference
      isCustom: !!customDescription, // Flag to indicate if this is a custom description
      order: benefitRelation.order // Include the order field
    };
  });

  return {
    ...plan,
    price,
    medicalPrice,
    // Add all prices for each currency
    allPrices: {
      regular: priceByCurrency,
      medical: medicalPriceByCurrency
    },
    // Keep the original prices array for backward compatibility
    prices: plan.prices,
    // Replace benefits with processed benefits
    benefits: processedBenefits
  };
}

export async function getProgrammeStats() {
  const [totalPurchases, monthlyPurchases, pendingPurchases] = await Promise.all([
    prisma.programmePurchase.count(),
    prisma.programmePurchase.count({
      where: {
        purchasedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.programmePurchase.count({ where: { status: 'PENDING' } })
  ]);

  // Calculate monthly revenue
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get revenue for all currencies from payments
  const [monthlyRevenueEGP, monthlyRevenueSAR, monthlyRevenueAED, monthlyRevenueUSD] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'EGP',
        paymentableType: 'PROGRAMME_PURCHASE',
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'SAR',
        paymentableType: 'PROGRAMME_PURCHASE',
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'AED',
        paymentableType: 'PROGRAMME_PURCHASE',
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        currency: 'USD',
        paymentableType: 'PROGRAMME_PURCHASE',
        createdAt: { gte: startOfMonth }
      }
    })
  ]);

  return {
    totalPurchases,
    monthlyPurchases,
    pendingPurchases,
    monthlyRevenue: {
      EGP: Number(monthlyRevenueEGP._sum.amount || 0),
      SAR: Number(monthlyRevenueSAR._sum.amount || 0),
      AED: Number(monthlyRevenueAED._sum.amount || 0),
      USD: Number(monthlyRevenueUSD._sum.amount || 0)
    }
  };
}

export async function getPayments(query = {}) {
  const { page = 1, pageSize = 10, status, method } = query;
  const skip = (page - 1) * pageSize;
  
  const where = {};
  if (status && status !== 'all') {
    where.status = status;
  }
  if (method && method !== 'all') {
    where.method = method;
  }
  
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.payment.count({ where })
  ]);

  // Fetch related entities for each payment based on paymentableType and paymentableId
  const paymentsWithDetails = await Promise.all(
    payments.map(async (payment) => {
      let relatedEntity = null;
      
      if (payment.paymentableType === 'SUBSCRIPTION' && payment.paymentableId) {
        relatedEntity = await prisma.subscription.findUnique({
          where: { id: payment.paymentableId },
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
            subscriptionPlan: {
              select: {
                name: true
              }
            }
          }
        });
      } else if (payment.paymentableType === 'ORDER' && payment.paymentableId) {
        relatedEntity = await prisma.order.findUnique({
          where: { id: payment.paymentableId },
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        });
      } else if (payment.paymentableType === 'PROGRAMME_PURCHASE' && payment.paymentableId) {
        relatedEntity = await prisma.programmePurchase.findUnique({
          where: { id: payment.paymentableId },
          select: {
            id: true,
            purchaseNumber: true,
            status: true,
            programme: {
              select: {
                name: true
              }
            }
          }
        });
      }

      return {
        ...payment,
        // Add the related entity based on its type
        ...(payment.paymentableType === 'SUBSCRIPTION' && relatedEntity && { subscription: relatedEntity }),
        ...(payment.paymentableType === 'ORDER' && relatedEntity && { order: relatedEntity }),
        ...(payment.paymentableType === 'PROGRAMME_PURCHASE' && relatedEntity && { programmePurchase: relatedEntity })
      };
    })
  );
  
  return { items: paymentsWithDetails, total, page, pageSize };
}


export async function getLeads(query = {}) {
  const { page = 1, pageSize = 10, status } = query;
  const skip = (page - 1) * pageSize;
  
  const where = status ? { status } : {};
  
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.lead.count({ where })
  ]);
  
  return { items: leads, total, page, pageSize };
}

export async function getLeadsStats() {
  const [total, newLeads, contacted] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'CONTACTED' } })
  ]);
  
  return { total, newLeads, contacted };
}

export async function getLeadById(id) {
  return prisma.lead.findUnique({ where: { id } });
}

export async function updateLeadStatus(id, status) {
  return prisma.lead.update({ where: { id }, data: { status } });
}

export async function deleteLead(id) {
  return prisma.lead.delete({ where: { id } });
}

export async function getProgrammes(query = {}) {
  const { page = 1, pageSize = 10 } = query;
  const skip = (page - 1) * pageSize;
  
  const [programmes, total] = await Promise.all([
    prisma.programme.findMany({
      where: {
        deletedAt: null
      },
      skip,
      take: pageSize,
      orderBy: { order: 'asc' },
      include: {
        prices: true,
        _count: {
          select: {
            purchases: true
          }
        }
      }
    }),
    prisma.programme.count({
      where: {
        deletedAt: null
      }
    })
  ]);
  
  return { items: programmes, total, page, pageSize };
}

export async function getProgrammeById(id) {
  return prisma.programme.findUnique({ 
    where: { 
      id,
      deletedAt: null
    },
    include: {
      prices: true
    }
  });
}

export async function createProgramme(data) {
  // Validate loyalty points required
  if (data.loyaltyPointsRequired !== undefined && data.loyaltyPointsRequired !== null && data.loyaltyPointsRequired <= 0) {
    const error = new Error("Loyalty points required must be greater than 0");
    error.status = 400;
    error.expose = true;
    throw error;
  }
  
  // Extract prices from data if provided
  const { prices, ...programmeData } = data;
  
  return prisma.$transaction(async (tx) => {
    // Create the programme
    const programme = await tx.programme.create({ data: programmeData });
    
    // Create prices if provided
    if (prices && Array.isArray(prices) && prices.length > 0) {
      const priceData = prices.map(price => ({
        amount: new Decimal(price.amount),
        currency: price.currency,
        programmeId: programme.id
      }));
      
      await tx.programmePrice.createMany({
        data: priceData
      });
    }
    
    return programme;
  });
}

export async function updateProgramme(id, data) {
  // Validate loyalty points required
  if (data.loyaltyPointsRequired !== undefined && data.loyaltyPointsRequired !== null && data.loyaltyPointsRequired <= 0) {
    const error = new Error("Loyalty points required must be greater than 0");
    error.status = 400;
    error.expose = true;
    throw error;
  }
  
  // Check if programme exists and is not soft-deleted
  const existingProgramme = await prisma.programme.findUnique({ 
    where: { 
      id,
      deletedAt: null
    } 
  });
  
  if (!existingProgramme) {
    const error = new Error("Programme not found");
    error.status = 404;
    error.expose = true;
    throw error;
  }
  
  // Extract prices from data if provided
  const { prices, ...programmeData } = data;
  
  return prisma.$transaction(async (tx) => {
    // Update the programme
    const programme = await tx.programme.update({ where: { id }, data: programmeData });
    
    // Update prices if provided
    if (prices && Array.isArray(prices)) {
      // Delete existing prices for this programme
      await tx.programmePrice.deleteMany({
        where: {
          programmeId: id
        }
      });
      
      // Create new prices if any
      if (prices.length > 0) {
        const priceData = prices.map(price => ({
          amount: new Decimal(price.amount),
          currency: price.currency,
          programmeId: id
        }));
        
        await tx.programmePrice.createMany({
          data: priceData
        });
      }
    }
    
    return programme;
  });
}

export async function deleteProgramme(id) {
  return prisma.programme.update({ 
    where: { id }, 
    data: { isActive: false } 
  });
}

export async function updateProgrammeOrder(programmes) {
  return prisma.$transaction(
    programmes.map((programme, index) =>
      prisma.programme.update({
        where: { id: programme.id },
        data: { order: index + 1 }
      })
    )
  );
}

// Programme Purchases
export async function getProgrammePurchases(query = {}) {
  const { page = 1, pageSize = 10 } = query;
  const skip = (page - 1) * pageSize;
  
  const [purchases, total] = await Promise.all([
    prisma.programmePurchase.findMany({
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        programme: {
          select: {
            id: true,
            name: true,
            discountPercentage: true
          }
        },
        coupon: {
          select: {
            id: true,
            code: true,
            discountPercentage: true
          }
        }
      },
      orderBy: { purchasedAt: 'desc' }
    }),
    prisma.programmePurchase.count()
  ]);

  // Fetch payments for each purchase separately
  const purchasesWithPayments = await Promise.all(
    purchases.map(async (purchase) => {
      const payments = await prisma.payment.findMany({
        where: {
          paymentableType: 'PROGRAMME_PURCHASE',
          paymentableId: purchase.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        ...purchase,
        payments: payments
      };
    })
  );
  
  return { items: purchasesWithPayments, total, page, pageSize };
}

export async function getProgrammePurchaseById(id) {
  return prisma.programmePurchase.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      programme: {
        select: {
          id: true,
          name: true
        }
      },
      coupon: {
        select: {
          id: true,
          code: true,
          discountPercentage: true
        }
      },
      payments: {
        where: {
          paymentableType: 'PROGRAMME_PURCHASE'
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          method: true,
          status: true,
          paymentReference: true,
          paymentProofUrl: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function updateProgrammePurchase(id, data) {
  return prisma.programmePurchase.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      programme: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}



export async function getPaymentById(id) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      order: true
    }
  });
}

export async function updatePayment(id, data) {
  return prisma.payment.update({ where: { id }, data });
}

export async function getCoupons(query = {}) {
  const { page = 1, pageSize = 10 } = query;
  const skip = (page - 1) * pageSize;
  
  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.coupon.count()
  ]);
  
  // Transform database fields to frontend field names
  const transformedCoupons = coupons.map(coupon => ({
    ...coupon,
    discountValue: coupon.discountPercentage,
    maxRedemptionsPerUser: coupon.maxRedemptionsPerUser,
    maxRedemptions: coupon.maxRedemptions,
    totalRedemptions: coupon.totalRedemptions
  }));
  
  return { items: transformedCoupons, total, page, pageSize };
}

export async function getCouponById(id) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return null;
  
  // Transform database fields to frontend field names
  return {
    ...coupon,
    discountValue: coupon.discountPercentage,
    maxRedemptionsPerUser: coupon.maxRedemptionsPerUser,
    totalRedemptions: coupon.totalRedemptions
  };
}

export async function createCoupon(data) {
  return prisma.coupon.create({ data });
}

export async function updateCoupon(id, data) {
  return prisma.coupon.update({ where: { id }, data });
}

export async function deleteCoupon(id) {
  return prisma.coupon.delete({ where: { id } });
}

export async function getTransformations(query = {}) {
  const { page = 1, pageSize = 10 } = query;
  const skip = (page - 1) * pageSize;
  
  const [transformations, total] = await Promise.all([
    prisma.transformation.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.transformation.count()
  ]);
  
  return { items: transformations, total, page, pageSize };
}

export async function getTransformationById(id) {
  return prisma.transformation.findUnique({ where: { id } });
}

export async function createTransformation(data) {
  return prisma.transformation.create({ data });
}

export async function updateTransformation(id, data) {
  return prisma.transformation.update({ where: { id }, data });
}

export async function deleteTransformation(id) {
  return prisma.transformation.delete({ where: { id } });
}


export async function getAnalyticsTrends(query = {}) {
  // Return mock data for now
  return {
    revenue: [
      { month: 'Jan', value: 1000 },
      { month: 'Feb', value: 1200 },
      { month: 'Mar', value: 1100 },
      { month: 'Apr', value: 1300 },
      { month: 'May', value: 1400 },
      { month: 'Jun', value: 1500 }
    ],
    users: [
      { month: 'Jan', value: 50 },
      { month: 'Feb', value: 60 },
      { month: 'Mar', value: 55 },
      { month: 'Apr', value: 65 },
      { month: 'May', value: 70 },
      { month: 'Jun', value: 75 }
    ]
  };
}

export async function getMonthlyTrends(query = {}) {
  const { months = 12 } = query;
  
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  
  // Fetch exchange rates once for all calculations
  let exchangeRates = {
    EGP: 0.032,
    SAR: 0.27,
    AED: 0.27,
    USD: 1
  };
  
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = await response.json();
      exchangeRates = {
        EGP: data.rates.EGP ? 1 / data.rates.EGP : 0.032,
        SAR: data.rates.SAR ? 1 / data.rates.SAR : 0.27,
        AED: data.rates.AED ? 1 / data.rates.AED : 0.27,
        USD: 1
      };
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates, using fallback rates:', error);
  }
  
  // Get monthly data for the last N months
  const monthlyData = [];
  
  for (let i = 0; i < months; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - months + 1 + i + 1, 0, 23, 59, 59);
    
    const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
    const year = monthStart.getFullYear();
    
    // Get revenue data for this month (all currencies) for each category
    const [
      // Overall revenue
      egpRevenue, 
      sarRevenue, 
      aedRevenue,
      usdRevenue,
      // Subscription data
      subscriptions, 
      subscriptionEgpRevenue, 
      subscriptionSarRevenue,
      subscriptionAedRevenue,
      subscriptionUsdRevenue,
      // Order data
      orders, 
      orderEgpRevenue, 
      orderSarRevenue,
      orderAedRevenue,
      orderUsdRevenue,
      // Programme data
      programmes, 
      programmeEgpRevenue, 
      programmeSarRevenue,
      programmeAedRevenue,
      programmeUsdRevenue
    ] = await Promise.all([
      // Overall EGP Revenue from payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'EGP',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Overall SAR Revenue from payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'SAR',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Overall AED Revenue from payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'AED',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Overall USD Revenue from payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'USD',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Subscriptions count for this month
      prisma.subscription.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Subscription revenue (EGP)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'EGP',
          paymentableType: 'SUBSCRIPTION',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Subscription revenue (SAR)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'SAR',
          paymentableType: 'SUBSCRIPTION',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Subscription revenue (AED)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'AED',
          paymentableType: 'SUBSCRIPTION',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Subscription revenue (USD)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'USD',
          paymentableType: 'SUBSCRIPTION',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Orders count for this month
      prisma.order.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Order revenue (EGP)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'EGP',
          paymentableType: 'ORDER',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Order revenue (SAR)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'SAR',
          paymentableType: 'ORDER',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Order revenue (AED)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'AED',
          paymentableType: 'ORDER',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Order revenue (USD)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'USD',
          paymentableType: 'ORDER',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Programme purchases count for this month
      prisma.programmePurchase.count({
        where: {
          purchasedAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Programme revenue (EGP)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'EGP',
          paymentableType: 'PROGRAMME_PURCHASE',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Programme revenue (SAR)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'SAR',
          paymentableType: 'PROGRAMME_PURCHASE',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Programme revenue (AED)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'AED',
          paymentableType: 'PROGRAMME_PURCHASE',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      // Programme revenue (USD)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          currency: 'USD',
          paymentableType: 'PROGRAMME_PURCHASE',
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      })
    ]);
    
    monthlyData.push({
      month: monthName,
      year: year,
      // Overall revenue
      egpRevenue: Number((Number(egpRevenue._sum.amount || 0)).toFixed(2)),
      sarRevenue: Number((Number(sarRevenue._sum.amount || 0)).toFixed(2)),
      aedRevenue: Number((Number(aedRevenue._sum.amount || 0)).toFixed(2)),
      usdRevenue: Number((Number(usdRevenue._sum.amount || 0)).toFixed(2)),
      totalRevenue: Number(egpRevenue._sum.amount || 0) + (Number(sarRevenue._sum.amount || 0) * 7.5) + (Number(aedRevenue._sum.amount || 0) * 7.5) + (Number(usdRevenue._sum.amount || 0) * 30), // Convert to EGP
      totalRevenueUSD: Number(((Number(egpRevenue._sum.amount || 0) * exchangeRates.EGP) + (Number(sarRevenue._sum.amount || 0) * exchangeRates.SAR) + (Number(aedRevenue._sum.amount || 0) * exchangeRates.AED) + (Number(usdRevenue._sum.amount || 0) * exchangeRates.USD)).toFixed(2)), // Convert to USD using live rates
      // Counts
      subscriptions: subscriptions,
      orders: orders,
      programmes: programmes,
      // Category-specific revenue (flattened for Recharts)
      subscriptionRevenueEgp: Number((Number(subscriptionEgpRevenue._sum.amount || 0)).toFixed(2)),
      subscriptionRevenueSar: Number((Number(subscriptionSarRevenue._sum.amount || 0)).toFixed(2)),
      subscriptionRevenueAed: Number((Number(subscriptionAedRevenue._sum.amount || 0)).toFixed(2)),
      subscriptionRevenueUsd: Number((Number(subscriptionUsdRevenue._sum.amount || 0)).toFixed(2)),
      subscriptionRevenueTotal: Number(subscriptionEgpRevenue._sum.amount || 0) + (Number(subscriptionSarRevenue._sum.amount || 0) * 7.5) + (Number(subscriptionAedRevenue._sum.amount || 0) * 7.5) + (Number(subscriptionUsdRevenue._sum.amount || 0) * 30),
      orderRevenueEgp: Number((Number(orderEgpRevenue._sum.amount || 0)).toFixed(2)),
      orderRevenueSar: Number((Number(orderSarRevenue._sum.amount || 0)).toFixed(2)),
      orderRevenueAed: Number((Number(orderAedRevenue._sum.amount || 0)).toFixed(2)),
      orderRevenueUsd: Number((Number(orderUsdRevenue._sum.amount || 0)).toFixed(2)),
      orderRevenueTotal: Number(orderEgpRevenue._sum.amount || 0) + (Number(orderSarRevenue._sum.amount || 0) * 7.5) + (Number(orderAedRevenue._sum.amount || 0) * 7.5) + (Number(orderUsdRevenue._sum.amount || 0) * 30),
      programmeRevenueEgp: Number((Number(programmeEgpRevenue._sum.amount || 0)).toFixed(2)),
      programmeRevenueSar: Number((Number(programmeSarRevenue._sum.amount || 0)).toFixed(2)),
      programmeRevenueAed: Number((Number(programmeAedRevenue._sum.amount || 0)).toFixed(2)),
      programmeRevenueUsd: Number((Number(programmeUsdRevenue._sum.amount || 0)).toFixed(2)),
      programmeRevenueTotal: Number(programmeEgpRevenue._sum.amount || 0) + (Number(programmeSarRevenue._sum.amount || 0) * 7.5) + (Number(programmeAedRevenue._sum.amount || 0) * 7.5) + (Number(programmeUsdRevenue._sum.amount || 0) * 30)
    });
  }
  
  return {
    monthlyData,
    summary: {
      totalEgpRevenue: Number(monthlyData.reduce((sum, month) => sum + month.egpRevenue, 0).toFixed(2)),
      totalSarRevenue: Number(monthlyData.reduce((sum, month) => sum + month.sarRevenue, 0).toFixed(2)),
      totalAedRevenue: Number(monthlyData.reduce((sum, month) => sum + month.aedRevenue, 0).toFixed(2)),
      totalUsdRevenue: Number(monthlyData.reduce((sum, month) => sum + month.usdRevenue, 0).toFixed(2)),
      totalRevenue: monthlyData.reduce((sum, month) => sum + month.totalRevenue, 0),
      totalRevenueUSD: Number(((monthlyData.reduce((sum, month) => sum + month.egpRevenue, 0) * exchangeRates.EGP) + 
                       (monthlyData.reduce((sum, month) => sum + month.sarRevenue, 0) * exchangeRates.SAR) + 
                       (monthlyData.reduce((sum, month) => sum + month.aedRevenue, 0) * exchangeRates.AED) + 
                       (monthlyData.reduce((sum, month) => sum + month.usdRevenue, 0) * exchangeRates.USD)).toFixed(2)),
      totalSubscriptions: monthlyData.reduce((sum, month) => sum + month.subscriptions, 0),
      totalOrders: monthlyData.reduce((sum, month) => sum + month.orders, 0),
      totalProgrammes: monthlyData.reduce((sum, month) => sum + month.programmes, 0)
    }
  };
}

export async function getTopSelling(query = {}) {
  const { type = 'programmes', limit = 10 } = query;
  
  if (type === 'programmes') {
    return getTopSellingProgrammes(limit);
  } else if (type === 'subscriptions') {
    return getTopSellingSubscriptions(limit);
  } else if (type === 'products') {
    return getTopSellingProducts(limit);
  }
  
  return [];
}

async function getTopSellingProgrammes(limit = 10) {
  // Get programmes with their purchase counts and revenue
  const programmes = await prisma.programme.findMany({
    include: {
      _count: {
        select: {
          purchases: true
        }
      }
    }
  });

  // Calculate revenue for each programme
  const programmesWithStats = await Promise.all(
    programmes.map(async (programme) => {
      const revenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          paymentableType: 'PROGRAMME_PURCHASE',
          paymentableId: programme.id
        }
      });

      return {
        id: programme.id,
        name: programme.name,
        sales: programme._count.purchases,
        revenue: Number(revenue._sum.amount || 0)
      };
    })
  );

  // Sort by sales and return top N
  return programmesWithStats
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

async function getTopSellingSubscriptions(limit = 10) {
  // Get subscription plans with their subscription counts and revenue
  const plans = await prisma.subscriptionPlan.findMany({
    include: {
      _count: {
        select: {
          subscriptions: true
        }
      }
    }
  });

  // Calculate revenue for each plan
  const plansWithStats = await Promise.all(
    plans.map(async (plan) => {
      // Get subscriptions for this plan and calculate revenue from their payments
      const subscriptions = await prisma.subscription.findMany({
        where: {
          subscriptionPlanId: plan.id
        },
        include: {
          user: true
        }
      });

      // Calculate total revenue from successful payments for these subscriptions
      const subscriptionIds = subscriptions.map(sub => sub.id);
      const revenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          paymentableType: 'SUBSCRIPTION',
          paymentableId: { in: subscriptionIds }
        }
      });

      return {
        id: plan.id,
        name: plan.name,
        sales: plan._count.subscriptions,
        revenue: Number(revenue._sum.amount || 0)
      };
    })
  );

  // Sort by sales and return top N
  return plansWithStats
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

async function getTopSellingProducts(limit = 10) {
  // Get products with their variant counts
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: {
          images: true,
          cartItems: true,
          orderItems: true
        }
      }
    }
  });

  // Calculate sales and revenue for each product through its variants
  const productsWithStats = await Promise.all(
    products.map(async (product) => {
      // Get order items for this product through its variants
      const orderItems = await prisma.orderItem.findMany({
        where: {
          productId: product.id,
          order: {
            status: 'PAID'
          }
        },
        select: {
          quantity: true,
          totalPrice: true
        }
      });

      const sales = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

      return {
        id: product.id,
        name: product.name,
        sales: sales,
        revenue: revenue
      };
    })
  );

  // Sort by sales and return top N
  return productsWithStats
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

export async function getRecentActivity(query = {}) {
  const { limit = 10 } = query;
  
  try {
    // Get recent activities from different sources
    const [
      recentOrders,
      recentSubscriptions,
      recentPayments,
      recentUsers,
      recentProgrammePurchases,
      recentLoyaltyTransactions
    ] = await Promise.all([
      // Recent orders
      prisma.order.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      
      // Recent subscriptions
      prisma.subscription.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              mobileNumber: true
            }
          },
          subscriptionPlan: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Recent successful payments
      prisma.payment.findMany({
        take: Math.ceil(limit / 3),
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      
      // Recent user registrations
      prisma.user.findMany({
        take: Math.ceil(limit / 4),
        where: { role: 'MEMBER' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true
        }
      }),
      
      // Recent programme purchases
      prisma.programmePurchase.findMany({
        take: Math.ceil(limit / 3),
        orderBy: { purchasedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          programme: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Recent loyalty transactions
      prisma.loyaltyTransaction.findMany({
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    ]);

    // Transform data into a unified activity format
    const activities = [];

    // Add orders
    recentOrders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'New Order',
        description: `Order #${order.orderNumber} by ${order.user.firstName} ${order.user.lastName}`,
        user: order.user,
        amount: order.currency === 'EGP' ? `EGP ${order.total || 0}` : `SAR ${order.total || 0}`,
        status: order.status,
        timestamp: order.createdAt,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          currency: order.currency
        }
      });
    });

    // Add subscriptions
    recentSubscriptions.forEach(subscription => {
      activities.push({
        id: `subscription-${subscription.id}`,
        type: 'subscription',
        title: 'Subscription Activity',
        description: `${subscription.status} subscription for ${subscription.user.firstName} ${subscription.user.lastName}`,
        user: subscription.user,
        plan: subscription.subscriptionPlan?.name || 'Unknown Plan',
        status: subscription.status,
        timestamp: subscription.createdAt,
        metadata: {
          subscriptionId: subscription.id,
          subscriptionNumber: subscription.subscriptionNumber
        }
      });
    });

    // Add payments
    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: 'Payment Received',
        description: `Payment of ${payment.currency} ${payment.amount} from ${payment.user?.firstName || 'Unknown'} ${payment.user?.lastName || 'User'}`,
        user: payment.user,
        amount: `${payment.currency} ${payment.amount}`,
        method: payment.method,
        timestamp: payment.createdAt,
        metadata: {
          paymentId: payment.id,
          paymentReference: payment.paymentReference
        }
      });
    });

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: 'New User Registration',
        description: `${user.firstName} ${user.lastName} joined the platform`,
        user: user,
        timestamp: user.createdAt,
        metadata: {
          userId: user.id
        }
      });
    });

    // Add programme purchases
    recentProgrammePurchases.forEach(purchase => {
      activities.push({
        id: `programme-${purchase.id}`,
        type: 'programme',
        title: 'Programme Purchase',
        description: `${purchase.user.firstName} ${purchase.user.lastName} purchased ${purchase.programme.name}`,
        user: purchase.user,
        amount: `${purchase.currency} ${purchase.price}`,
        status: purchase.status,
        timestamp: purchase.purchasedAt,
        metadata: {
          programmePurchaseId: purchase.id,
          programmeId: purchase.programmeId
        }
      });
    });

    // Add loyalty transactions
    recentLoyaltyTransactions.forEach(transaction => {
      const isEarned = transaction.points > 0;
      activities.push({
        id: `loyalty-${transaction.id}`,
        type: 'loyalty',
        title: isEarned ? 'Loyalty Points Earned' : 'Loyalty Points Redeemed',
        description: `${transaction.user.firstName} ${transaction.user.lastName} ${isEarned ? 'earned' : 'redeemed'} ${Math.abs(transaction.points)} points`,
        user: transaction.user,
        points: transaction.points,
        reason: transaction.reason,
        source: transaction.source,
        timestamp: transaction.createdAt,
        metadata: {
          transactionId: transaction.id,
          type: transaction.type,
          source: transaction.source
        }
      });
    });

    // Sort all activities by timestamp (most recent first) and limit
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Subscription management
export async function getSubscriptions(query = {}) {
  const { page = 1, pageSize = 10, status } = query;
  const skip = (page - 1) * pageSize;
  
  const where = status ? { status } : {};

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true } },
        subscriptionPlan: true,
        coupon: { select: { id: true, code: true, discountPercentage: true } }
      }
    }),
    prisma.subscription.count({ where })
  ]);

  // Fetch payments for each subscription separately
  const subscriptionsWithPayments = await Promise.all(
    subscriptions.map(async (subscription) => {
      const payments = await prisma.payment.findMany({
        where: {
          paymentableId: subscription.id,
          paymentableType: 'SUBSCRIPTION'
        },
        select: {
          id: true,
          method: true,
          status: true,
          paymentProofUrl: true,
          paymentReference: true,
          amount: true,
          currency: true,
          paymentableType: true,
          paymentableId: true,
          transactionId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        ...subscription,
        payments
      };
    })
  );

  return { items: subscriptionsWithPayments, total, page, pageSize };
}

export async function getSubscriptionById(id) {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true } },
      subscriptionPlan: true,
      payments: true
    }
  });
}

export async function updateSubscription(id, data) {
  return prisma.subscription.update({
    where: { id },
    data: {
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate
    }
  });
}

export async function deleteSubscription(id) {
  return prisma.subscription.delete({ where: { id } });
}

export async function cancelSubscription(id) {
  return prisma.subscription.update({
    where: { id },
    data: { status: 'CANCELLED' }
  });
}

export async function exportSubscriptions() {
  return prisma.subscription.findMany({
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true } },
      subscriptionPlan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getBenefits() {
  return prisma.benefit.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBenefit(data) {
  return prisma.benefit.create({
    data: {
      description: data.description
    }
  });
}

export async function updateBenefit(id, data) {
  return prisma.benefit.update({
    where: { id },
    data: {
      description: data.description
    }
  });
}

export async function deleteBenefit(id) {
  return prisma.benefit.delete({
    where: { id }
  });
}

export async function createAdmin(data) {
  const { email, password, firstName, lastName, mobileNumber, building, street, city, country, postcode } = data;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.status = 409;
    error.expose = true;
    throw error;
  }
  
  // Hash password
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      mobileNumber: mobileNumber || null,
      building: building || null,
      street: street || null,
      city: city || null,
      country: country || null,
      postcode: postcode || null,
      role: 'ADMIN',
      loyaltyPoints: 0,
    }
  });
  
  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = adminUser;
  return userWithoutPassword;
}

// Helper function to handle plan-benefit relationships
async function handlePlanBenefits(planId, benefits) {
  // Handle both simple benefit IDs and benefit objects with custom descriptions and order
  const benefitRelations = benefits.map((benefit, index) => {
    const order = index + 1; // Default order based on array position
    
    if (typeof benefit === 'string') {
      // Simple benefit ID
      return {
        subscriptionPlanId: planId,
        benefitId: benefit,
        order: order
      };
    } else if (benefit.id && benefit.description) {
      // Benefit object with custom description
      return {
        subscriptionPlanId: planId,
        benefitId: benefit.id,
        customDescription: benefit.description,
        order: benefit.order || order
      };
    } else {
      // Fallback to simple ID
      return {
        subscriptionPlanId: planId,
        benefitId: benefit.id || benefit,
        order: benefit.order || order
      };
    }
  });
  
  if (benefitRelations.length > 0) {
    await prisma.subscriptionPlanBenefit.createMany({
      data: benefitRelations,
      skipDuplicates: true
    });
  }
}

// Helper function to handle plan pricing
async function handlePlanPrices(planId, prices) {
  // Delete existing prices for this plan
  await prisma.subscriptionPlanPrice.deleteMany({
    where: {
      subscriptionPlanId: planId
    }
  });
  
  // Create new prices
  const priceData = prices.map(price => ({
    amount: price.amount,
    currency: price.currency,
    subscriptionPlanId: planId,
    type: price.type || 'NORMAL' // Default to NORMAL if not specified
  }));
  
  if (priceData.length > 0) {
    await prisma.subscriptionPlanPrice.createMany({
      data: priceData,
      skipDuplicates: true
    });
  }
}


