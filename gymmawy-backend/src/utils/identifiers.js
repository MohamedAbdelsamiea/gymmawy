/**
 * Utility functions for generating unique identifiers
 */

export function generatePurchaseNumber() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `PROG-${timestamp}-${randomSuffix}`;
}

export function generatePaymentReference() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `PAY-${timestamp}-${randomSuffix}`;
}

export function generateOrderNumber() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `ORD-${timestamp}-${randomSuffix}`;
}

export function generateSubscriptionNumber() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `SUB-${timestamp}-${randomSuffix}`;
}
